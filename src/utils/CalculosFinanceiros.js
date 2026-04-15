/**
 * Utility functions for financial and tax calculations
 */

export const CalculosFinanceiros = {
  // CLT Calculations - Updated for 2024/2025 Tables
  calcularINSS: (salarioBruto) => {
    let inss = 0;
    if (salarioBruto <= 1412.00) {
      inss = salarioBruto * 0.075;
    } else if (salarioBruto <= 2666.68) {
      inss = (1412.00 * 0.075) + ((salarioBruto - 1412.00) * 0.09);
    } else if (salarioBruto <= 4000.03) {
      inss = (1412.00 * 0.075) + ((2666.68 - 1412.00) * 0.09) + ((salarioBruto - 2666.68) * 0.12);
    } else if (salarioBruto <= 7786.02) {
      inss = (1412.00 * 0.075) + ((2666.68 - 1412.00) * 0.09) + ((4000.03 - 2666.68) * 0.12) + ((salarioBruto - 4000.03) * 0.14);
    } else {
      inss = 908.85; // Teto 2024
    }
    return Number(inss.toFixed(2));
  },

  calcularIRRF: (baseCalculo) => {
    let irrf = 0;
    // Dedução simplificada ou por dependente seria aplicada antes de passar o baseCalculo
    if (baseCalculo <= 2259.20) {
      irrf = 0;
    } else if (baseCalculo <= 2826.65) {
      irrf = (baseCalculo * 0.075) - 169.44;
    } else if (baseCalculo <= 3751.05) {
      irrf = (baseCalculo * 0.15) - 381.44;
    } else if (baseCalculo <= 4664.68) {
      irrf = (baseCalculo * 0.225) - 662.77;
    } else {
      irrf = (baseCalculo * 0.275) - 896.00;
    }
    return Math.max(0, Number(irrf.toFixed(2)));
  },

  calcularFGTS: (salarioBruto) => {
    return Number((salarioBruto * 0.08).toFixed(2));
  },

  calcularCustoEmpresa: (salarioBruto, encargos = 0.28) => { 
    // Exemplo: 20% INSS Patronal + 8% FGTS + RAT + Outros (Simples ou Lucro Real varia)
    // Default 28% for simulation
    return Number((salarioBruto * (1 + encargos)).toFixed(2));
  },

  calcularFeriasProporcionais: (salario, mesesTrabalhados) => {
    return Number(((salario / 12) * mesesTrabalhados).toFixed(2));
  },

  calcularDecimoTerceiroProporcional: (salario, mesesTrabalhados) => {
    return Number(((salario / 12) * mesesTrabalhados).toFixed(2));
  },

  calcularLiquido: (bruto, descontos, acrescimos) => {
    return Number((bruto + acrescimos - descontos).toFixed(2));
  },

  formatarMoeda: (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  }
};