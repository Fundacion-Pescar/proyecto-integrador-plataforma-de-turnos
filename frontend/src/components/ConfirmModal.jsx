export default function ConfirmModal({
  abierto,
  titulo = 'Confirmar',
  mensaje,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  peligro = false,
  cargando = false,
  onConfirmar,
  onCancelar,
}) {
  if (!abierto) return null;

  return (
    <div className="modal-overlay" role="presentation" onClick={onCancelar}>
      <div
        className="modal-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="modal-titulo"
        aria-describedby="modal-mensaje"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="modal-titulo">{titulo}</h2>
        <p id="modal-mensaje">{mensaje}</p>
        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-secundario-admin"
            onClick={onCancelar}
            disabled={cargando}
          >
            {textoCancelar}
          </button>
          <button
            type="button"
            className={`btn ${peligro ? 'btn-peligro' : 'btn-primario'}`}
            onClick={onConfirmar}
            disabled={cargando}
          >
            {cargando ? 'Procesando...' : textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}
