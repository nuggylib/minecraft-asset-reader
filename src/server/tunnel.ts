import ngrok from "ngrok"

export class Tunnel {
  ngrokUrl = ``
  async initTunnel({ port }: { port: number }) {
    this.ngrokUrl = await ngrok.connect(port)
  }
  getNgrokUrl() {
    return this.ngrokUrl
  }
}
