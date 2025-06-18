export interface TestMethod {
  value: string
  label: string
}

export interface ProblemConfig {
  name: string
  methods: TestMethod[]
}

export const problemConfig: Record<string, ProblemConfig> = {
  triangle_judge: {
    name: '三角形判断',
    methods: [
      { value: 'boundary_basic', label: '基本边界值测试' },
      { value: 'boundary_robust', label: '健壮边界值测试' },
      { value: 'equivalent_weak', label: '弱一般等价类测试' },
      { value: 'equivalent_strong', label: '强一般等价类测试' },
      { value: 'equivalent_weak_robust', label: '弱健壮等价类测试' },
      { value: 'equivalent_strong_robust', label: '强健壮等价类测试' },
    ],
  },
  computer_selling: {
    name: '计算机销售',
    methods: [
      { value: 'boundary_basic', label: '基本边界值测试' },
      { value: 'boundary_robust', label: '健壮边界值测试' },
    ],
  },
  telecom_system: {
    name: '电信系统',
    methods: [
      { value: 'boundary_basic', label: '基本边界值测试' },
      { value: 'boundary_robust', label: '健壮边界值测试' },
      { value: 'equivalent_weak', label: '弱一般等价类测试' },
      { value: 'equivalent_strong', label: '强一般等价类测试' },
      { value: 'equivalent_weak_robust', label: '弱健壮等价类测试' },
      { value: 'equivalent_strong_robust', label: '强健壮等价类测试' },
      { value: 'decision_table', label: '决策表测试' },
    ],
  },
  calendar_problem: {
    name: '日历问题',
    methods: [
      { value: 'boundary_basic', label: '基本边界值测试' },
      { value: 'boundary_robust', label: '健壮边界值测试' },
      { value: 'equivalent_weak', label: '弱一般等价类测试' },
      { value: 'equivalent_strong', label: '强一般等价类测试' },
      { value: 'equivalent_weak_robust', label: '弱健壮等价类测试' },
      { value: 'equivalent_strong_robust', label: '强健壮等价类测试' },
      { value: 'decision_table', label: '决策表测试' },
    ],
  },
}
