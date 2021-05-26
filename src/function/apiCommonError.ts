class ApiCommonError {
  _deleted: boolean;

  _modal: any;

  constructor() {
    this._deleted = false;
  }

  set deleted(bol: boolean) {
    this._deleted = bol;
    this._modal = null;
  }

  get deleted() {
    return this._deleted;
  }

  set modal(modalInstance: any) {
    this._modal = modalInstance;
  }

  get modal(){
    return this._modal;
  }
}

export const popupError = new ApiCommonError();
