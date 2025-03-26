export default class FileFiller {
  public fillInput(element: HTMLInputElement): void {
    if (this.isImage(element)) {
      this.attach(element, this.imageFile());
      return;
    }

    if (this.isPdf(element)) {
      this.attach(element, this.pdfFile());
      return;
    }

    this.attach(element, this.textFile());
  }

  private attach(element: HTMLInputElement, file: File): void {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    // eslint-disable-next-line no-param-reassign
    element.files = dataTransfer.files;
  }

  private isImage(element: HTMLInputElement): boolean {
    return (
      element.accept === "image/*" ||
      element.accept.includes("png") ||
      element.name.includes("photo") ||
      element.name.includes("image")
    );
  }

  private isPdf(element: HTMLInputElement): boolean {
    return element.accept.includes("pdf") || element.name.includes("pdf") || element.name.includes("document");
  }

  private textFile() {
    return new File(["Hello world!"], "testFile.txt", { type: "text/plain" });
  }

  private imageFile(): File {
    return new File(
      [
        "data:image/png;base64,R0lGODlhDAAMAKIFAF5LAP/zxAAAANyuAP/gaP///wAAAAAAACH5BAEAAAUALAAAAAAMAAwAAAMlWLPcGjDKFYi9lxKBOaGcF35DhWHamZUW0K4mAbiwWtuf0uxFAgA7",
      ],
      "testFile.png",
      { type: "image/png" }
    );
  }

  private pdfFile(): File {
    return new File(
      [
        "data:application/pdf;base64,JVBERi0xLjAKMSAwIG9iajw8L1BhZ2VzIDIgMCBSPj5lbmRvYmogMiAwIG9iajw8L0tpZHNbMyAw\nIFJdL0NvdW50IDE+PmVuZG9iaiAzIDAgb2JqPDwvTWVkaWFCb3hbMCAwIDMgM10+PmVuZG9iagp0\ncmFpbGVyPDwvUm9vdCAxIDAgUj4+Cg==",
      ],
      "testFile.pdf",
      { type: "application/pdf" }
    );
  }
}
