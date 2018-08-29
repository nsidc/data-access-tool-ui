
export class CesiumUtils {

  public static viewerId: string = "globe";

  public static setCursorCrosshair() {
    const el = document.getElementById(this.viewerId);

    if (el && el.classList && el.classList.add) {
      el.classList.add("cursor-crosshair");
    }
  }

  public static unsetCursorCrosshair() {
    const el = document.getElementById(this.viewerId);

    if (el && el.classList && el.classList.remove) {
      el.classList.remove("cursor-crosshair");
    }
  }
}
