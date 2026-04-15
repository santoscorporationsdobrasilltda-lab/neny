import { 
  Heart, Users, Car, DollarSign, GraduationCap, Briefcase, Shield, BookOpen, 
  ShoppingCart, Wallet, FileText, Map, Trees, Eye, Bug, Activity, 
  School, Wheat, Hotel as Hospital, MessageSquare, Calculator, Settings, 
  Cpu, Wrench, Stethoscope, UserCog, Building2, LayoutDashboard, Package, 
  FileBarChart, ClipboardList, Factory, Fish, Video, Bell, MapPin, 
  PieChart, BarChart4, Truck, Grid, Smartphone
} from 'lucide-react';

export const allModulesList = [
  { id: 'gestao-empresarial', label: 'Gestão Empresarial', description: 'ERP completo para gestão empresarial integrada', icon: Building2, status: 'novo' },
  { id: 'contabilidade', label: 'Contabilidade', description: 'Gestão contábil, fiscal e auditoria', icon: BookOpen, status: 'novo' },
  { id: 'vendas-avancado', label: 'Vendas & CRM', description: 'Gestão de vendas, propostas e relacionamento', icon: ShoppingCart, status: 'novo' },
  { id: 'estoque-avancado', label: 'Estoque & Logística', description: 'Controle de estoque, lotes e movimentação', icon: Package, status: 'novo' },
  { id: 'pdv', label: 'Ponto de Venda (PDV)', description: 'Frente de caixa rápido e integrado', icon: Grid, status: 'novo' },
  { id: 'compras', label: 'Compras & Fornecedores', description: 'Gestão de compras e qualificação de fornecedores', icon: Truck, status: 'novo' },
  { id: 'financeiro-avancado', label: 'Financeiro Avançado', description: 'Tesouraria, fluxo de caixa e automação', icon: DollarSign, status: 'novo' },
  { id: 'relatorios-bi', label: 'BI & Analytics', description: 'Inteligência de negócios e relatórios', icon: PieChart, status: 'novo' },
  { id: 'rh-avancado', label: 'Recursos Humanos', description: 'Gestão de talentos e departamento pessoal', icon: Users, status: 'novo' },
  { id: 'projetos', label: 'Projetos & Serviços', description: 'Gestão de projetos e timesheet', icon: Briefcase, status: 'novo' },
  { id: 'seguranca-compliance', label: 'Segurança & Compliance', description: 'Controle de acesso e LGPD', icon: Shield, status: 'novo' },
  { id: 'mobilidade', label: 'Mobilidade', description: 'Apps e interfaces responsivas', icon: Smartphone, status: 'novo' },
  // Legacy/Specific Modules
  { id: 'saude', label: 'Saúde', description: 'Gestão de unidades de saúde', icon: Heart, status: 'active' },
  { id: 'educacao', label: 'Educação', description: 'Gestão escolar e matrículas', icon: GraduationCap, status: 'active' },
  { id: 'fazenda', label: 'Fazenda 5.0', description: 'Gestão agropecuária inteligente', icon: Factory, status: 'active' },
  { id: 'piscicultura', label: 'Piscicultura', description: 'Gestão de produção de peixes', icon: Fish, status: 'active' },
  { id: 'ordem_servico', label: 'Ordem de Serviço', description: 'Gestão de ordens de serviço', icon: ClipboardList, status: 'active' },
  { id: 'seguranca', label: 'Hub Segurança', description: 'Central de segurança unificada', icon: Shield, status: 'active' },
];