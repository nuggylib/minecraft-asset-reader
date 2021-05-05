const child_process = require(`child_process`)

// extractJar accepts a file path to a .jar file and extracts the .jar.
// TODO: Create types for file paths, error messages, stdout, and stderr.
export function extractJar(path: any) {
  let extractJarCmd = `jar xvf ${path}`

  child_process.exec(extractJarCmd, (error: any, stdout: any, stderr: any) => {
    if (error) {
      console.log(`error: ${error.message}`)
      return
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`)
      return
    }
    console.log(`stdout: ${stdout}`)
  })
}
