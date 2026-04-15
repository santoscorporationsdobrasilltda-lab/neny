export const CONTABILIDADE_EMPRESA_STORAGE_KEY = 'neny_contabilidade_empresa_id';

export const getSelectedEmpresaId = () => {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(CONTABILIDADE_EMPRESA_STORAGE_KEY) || '';
};

export const setSelectedEmpresaId = (id) => {
  if (typeof window === 'undefined') return;
  if (id) window.localStorage.setItem(CONTABILIDADE_EMPRESA_STORAGE_KEY, id);
  else window.localStorage.removeItem(CONTABILIDADE_EMPRESA_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent('neny-contabilidade-empresa-change', { detail: id || '' }));
};
