import { execSync } from "child_process";

function killPort(port: number) {
  try {
    const out = execSync(`netstat -ano | findstr ":${port}"`, { encoding: "utf8" });
    const pids = new Set<number>();
    for (const line of out.split("\n")) {
      const match = line.trim().match(/LISTENING\s+(\d+)$/);
      if (match) pids.add(Number(match[1]));
    }
    for (const pid of pids) {
      if (pid === process.pid) continue;
      try {
        execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" });
        console.log(`Porta ${port}: processo ${pid} terminado.`);
      } catch {
        /* já terminou */
      }
    }
  } catch {
    /* porta livre */
  }
}

killPort(3000);
killPort(24678);
