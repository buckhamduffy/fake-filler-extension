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
    return this.createFile(
      "data:image/png;base64,R0lGODlhDAAMAKIFAF5LAP/zxAAAANyuAP/gaP///wAAAAAAACH5BAEAAAUALAAAAAAMAAwAAAMlWLPcGjDKFYi9lxKBOaGcF35DhWHamZUW0K4mAbiwWtuf0uxFAgA7",
      "testFile.png"
    );
  }

  private pdfFile(): File {
    return this.createFile(
      "data:application/pdf;base64,JVBERi0xLjAKMSAwIG9iajw8L1BhZ2VzIDIgMCBSPj5lbmRvYmogMiAwIG9iajw8L0tpZHNbMyAwIFJdL0NvdW50IDE+PmVuZG9iaiAzIDAgb2JqPDwvTWVkaWFCb3hbMCAwIDMgM10+PmVuZG9iagp0cmFpbGVyPDwvUm9vdCAxIDAgUj4+Cg==",
      "testFile.pdf"
    );
  }

  private createFile(dataUrl: string, name: string): File {
    const match = dataUrl.match(/^data:(.+);base64,(.+)$/);

    if (!match) {
      throw new Error("Invalid data URL format");
    }

    const mimeType = match[1];
    const base64Data = match[2];

    const binary = atob(base64Data);
    // eslint-disable-next-line prefer-destructuring
    const length = binary.length;
    const data = new Uint8Array(length);

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < length; i++) {
      data[i] = binary.charCodeAt(i);
    }

    return new File([data], name, { type: mimeType });
  }
}
