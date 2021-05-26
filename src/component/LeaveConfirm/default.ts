export const LeaveConfirmText = "您正处于编辑状态，确定要放弃编辑的内容吗？";

export const confirmWindow = (callback: ()=>void)=>{
  const confirm = window.confirm(LeaveConfirmText);
  if (confirm) {
    callback()
  }
}