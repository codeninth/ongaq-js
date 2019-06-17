const workerFunction = `
self.onmessage = ()=>{
  console.log("@worker");
  self.postMessage("message from worker")
}
`
const blob = new Blob([workerFunction],{ type: "javascript/worker" })
const worker = new Worker(window.URL.createObjectURL(blob))
export default worker
