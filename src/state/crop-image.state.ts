import { atom } from "recoil";

export interface CropImageState {
  cropping: boolean;
  croppedDataURL: string | null;
}

const cropImageState = atom<CropImageState>({
  key: "cropImageState",
  default: {
    cropping: false,
    croppedDataURL: null,
  },
});

export default cropImageState;
