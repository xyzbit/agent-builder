import pty from 'node-pty';

function runDrizzleGenerateWithPty(): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log('🚀 Running drizzle-kit generate...');

    const ptyProcess = pty.spawn('pnpm', ['drizzle-kit', 'generate'], {
      name: 'xterm-color',
      cols: 80,
      rows: 30,
      cwd: process.cwd(),
      env: process.env,
    });

    let completed = false;

    const timeout = setTimeout(() => {
      if (!completed) {
        console.error('\n⏰ Timeout: drizzle-kit did not complete in 30 seconds. Aborting...');
        ptyProcess.kill();
        reject(new Error('Process timeout after 30 seconds'));
      }
    }, 30_000);

    ptyProcess.onData((data) => {
      process.stdout.write(data);
      // default behavior is column create, which is want we want
      ptyProcess.write('\r');
    });

    ptyProcess.onExit(({ exitCode }) => {
      completed = true;
      clearTimeout(timeout);

      if (exitCode === 0) {
        console.log('🎉 drizzle-kit completed successfully.');
        resolve();
      } else {
        reject(new Error(`❌ drizzle-kit exited with code ${exitCode}`));
      }
    });
  });
}



async function runWithRetry(maxRetries: number = 3): Promise<void> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`\n📝 Attempt migration generation ${attempt}/${maxRetries}`);
      await runDrizzleGenerateWithPty();
      return;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`\n❌ Attempt migration generation ${attempt} failed:`, errorMessage);

      if (attempt === maxRetries) {
        console.error('\n💥 All migration generation attempts failed. Exiting...');
        process.exit(1);
      } else {
        console.log(`\n🔄 Retrying migration generation in 2 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  await runWithRetry();
}