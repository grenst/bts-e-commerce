export function closeOpenModal() {
  const modal = document.querySelector('.modal-container');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => {
      modal.remove();
    }, 300);
  }
}

export function isModalOpen(): boolean {
  return !!document.querySelector('.modal-container.active');
}
