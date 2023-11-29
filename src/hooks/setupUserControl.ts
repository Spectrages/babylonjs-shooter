import { User } from "../utils/user.class";

export const setupUserControls = (canvas: HTMLCanvasElement, user: User) => {
  canvas.addEventListener("click", () => {
    user.fireWeapon();
  });

  document.body.addEventListener("keyup", (e: KeyboardEvent) => {
    if (e.code === "Space") {
      user.jump();
    }
  });
};
