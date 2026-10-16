/** Publicar condições somente após confirmação da loja. null não gera promessa. */
export interface Compromissos {
  prazoRespostaHorasUteis: number | null;
  medicao: { gratis: boolean | null; prazoDias: number | null } | null;
  prazoInstalacaoPorServico: { servico: string; dias: number }[] | null;
  garantia: { meses: number | null; cobertura: string | null; porEscrito: boolean | null; prazoAtendimentoDias: number | null } | null;
  cnpj: string | null;
  emiteNotaFiscal: boolean | null;
  pagamento: { pix: boolean | null; cartao: boolean | null; parcelas: number | null; sinalPercentual: number | null } | null;
  fotoEquipe: { src: string; alt: string; largura: number; altura: number } | null;
  nomesEquipe: { nome: string; funcao: string }[] | null;
  orcamentoEscrito: { detalhes: boolean | null; vidro: string | null; ferragem: string | null; validadeDias: number | null } | null;
  rotinaRetorno: string | null;
  avisoAtraso: string | null;
}
export const compromissos: Compromissos = {
  prazoRespostaHorasUteis: null,
  medicao: null,
  prazoInstalacaoPorServico: null,
  garantia: null,
  cnpj: null,
  emiteNotaFiscal: null,
  pagamento: null,
  fotoEquipe: null,
  nomesEquipe: null,
  orcamentoEscrito: null,
  rotinaRetorno: null,
  avisoAtraso: null,
};
