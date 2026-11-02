import { writeFile } from "node:fs/promises";

const endpoint = process.env.CDP_ENDPOINT ?? "http://127.0.0.1:9222";
const screenshotPath = process.env.SCREENSHOT_PATH;
const tabs = await fetch(`${endpoint}/json`).then((response) => response.json());
const page = tabs.find((tab) => tab.type === "page");

if (!page) throw new Error("No browser page found on the CDP endpoint");

const socket = new WebSocket(page.webSocketDebuggerUrl);
const result = await new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error("CDP evaluation timed out")), 10_000);
  let measurements;

  socket.addEventListener("open", () => {
    socket.send(JSON.stringify({
      id: 1,
      method: "Emulation.setDeviceMetricsOverride",
      params: { width: 390, height: 844, deviceScaleFactor: 1, mobile: true },
    }));
  });

  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id === 1) {
      socket.send(JSON.stringify({ id: 2, method: "Page.reload" }));
      return;
    }
    if (message.id === 2) {
      setTimeout(() => socket.send(JSON.stringify({
        id: 3,
        method: "Runtime.evaluate",
        params: {
          expression: `(() => {
            const dock = document.querySelector("[data-mobile-dock]");
            if (!dock) return { error: "Dock not found" };
            const rect = dock.getBoundingClientRect();
            return {
              viewportWidth: window.innerWidth,
              left: rect.left,
              right: rect.right,
              width: rect.width,
              scrollWidth: dock.scrollWidth,
              clientWidth: dock.clientWidth,
              itemWidths: [...dock.children].map((item) => item.getBoundingClientRect().width),
            };
          })()`,
          returnByValue: true,
        },
      })), 2_000);
      return;
    }
    if (message.id === 3) {
      measurements = message.result.result.value;
      if (screenshotPath) {
        socket.send(JSON.stringify({ id: 4, method: "Page.captureScreenshot", params: { format: "png" } }));
        return;
      }
    }
    if (message.id === 4) {
      writeFile(screenshotPath, Buffer.from(message.result.data, "base64"))
        .then(() => resolve(measurements), reject);
    } else if (message.id !== 3 || screenshotPath) {
      return;
    } else {
      resolve(measurements);
    }
    clearTimeout(timer);
    socket.close();
  });
});

console.log(JSON.stringify(result, null, 2));

if (result.error) throw new Error(result.error);
if (result.left < 0 || result.right > result.viewportWidth) {
  throw new Error("Mobile dock extends outside the viewport");
}
if (result.scrollWidth > result.clientWidth) {
  throw new Error("Mobile dock requires horizontal scrolling");
}
