# Privacidade Diferencial - Implementação e Configuração

## 🎯 Objetivo

Permitir a publicação de estatísticas agregadas sobre o cadastro imobiliário no **portal público**, garantindo que nenhum indivíduo possa ser reidentificado a partir dos dados publicados.

**Compliance**: LGPD Art. 13 (anonimização) + LAI (transparência ativa)

---

## 📚 Fundamentos Teóricos

### O que é Privacidade Diferencial?

**Definição Formal** (Dwork, 2006):

Um mecanismo $M$ satisfaz $(\varepsilon, \delta)$-privacidade diferencial se, para quaisquer dois datasets $D$ e $D'$ que diferem em no máximo um registro, e para qualquer conjunto de saídas $S$:

$$
Pr[M(D) \in S] \leq e^\varepsilon \cdot Pr[M(D') \in S] + \delta
$$

**Interpretação**:
- **$\varepsilon$ (epsilon)**: Orçamento de privacidade. Quanto menor, mais privacidade (mas menos utilidade).
  - $\varepsilon = 0.1$: Alta privacidade
  - $\varepsilon = 1.0$: Privacidade moderada
  - $\varepsilon = 10$: Baixa privacidade
- **$\delta$ (delta)**: Probabilidade de falha (geralmente $10^{-5}$ a $10^{-9}$)

**Propriedades**:
- **Composição**: Se executamos $k$ queries com $\varepsilon_i$, o orçamento total é $\sum_{i=1}^{k} \varepsilon_i$
- **Pós-processamento**: Processar resultado com DP não piora privacidade
- **Proteção contra ataques**: Mesmo com conhecimento auxiliar, adversário não consegue reidentificar

---

## 🔧 Algoritmos Implementados

### 1. Laplace Mechanism (para Contagens e Somas)

**Uso**: Queries de COUNT e SUM

**Algoritmo**:
1. Calcular valor verdadeiro: $f(D)$
2. Calcular sensibilidade: $\Delta f = \max_{D, D'} |f(D) - f(D')|$
   - Para COUNT: $\Delta f = 1$ (um registro muda a contagem em no máximo 1)
   - Para SUM (área total): $\Delta f = \text{max\_area}$ (pior caso: maior área possível)
3. Adicionar ruído Laplace: $\text{noise} \sim \text{Laplace}(0, \Delta f / \varepsilon)$
4. Retornar: $f(D) + \text{noise}$

**Distribuição de Laplace**:
$$
\text{Laplace}(\mu, b) = \frac{1}{2b} e^{-\frac{|x - \mu|}{b}}
$$

onde $b = \Delta f / \varepsilon$ (escala)

**Implementação (TypeScript)**:
```typescript
function laplace(mu: number, b: number): number {
  const u = Math.random() - 0.5;
  return mu - b * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
}

function applyLaplaceNoise(
  trueValue: number,
  sensitivity: number,
  epsilon: number,
): number {
  const scale = sensitivity / epsilon;
  const noise = laplace(0, scale);
  return trueValue + noise;
}

// Exemplo: COUNT de propriedades por bairro
const trueCount = 1500; // Valor real
const noisyCount = applyLaplaceNoise(trueCount, 1, 0.1);
console.log(noisyCount); // ~1523 (ruído de +23)
```

---

### 2. Gaussian Mechanism (para Médias)

**Uso**: Queries de MEAN (média)

**Algoritmo**:
1. Calcular valor verdadeiro: $\bar{x} = \frac{1}{n} \sum_{i=1}^{n} x_i$
2. Sensibilidade: $\Delta f = \frac{\text{max\_value}}{n}$ (simplificado)
3. Adicionar ruído Gaussiano: $\text{noise} \sim \mathcal{N}(0, \sigma^2)$
   - onde $\sigma = \frac{\Delta f \sqrt{2 \ln(1.25/\delta)}}{\varepsilon}$
4. Retornar: $\bar{x} + \text{noise}$

**Implementação**:
```typescript
function gaussian(mu: number, sigma: number): number {
  // Box-Muller transform
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mu + z0 * sigma;
}

function applyGaussianNoise(
  trueValue: number,
  sensitivity: number,
  epsilon: number,
  delta: number,
): number {
  const sigma = (sensitivity * Math.sqrt(2 * Math.log(1.25 / delta))) / epsilon;
  const noise = gaussian(0, sigma);
  return trueValue + noise;
}

// Exemplo: Média de área dos imóveis
const trueMean = 450.5; // m²
const noisyMean = applyGaussianNoise(trueMean, 50, 0.1, 0.00001);
console.log(noisyMean); // ~465.3
```

---

### 3. Threshold Suppression (Supressão de Células Pequenas)

**Uso**: Evitar publicação de estatísticas com poucos registros (risco de reidentificação)

**Regra**: Se $\text{count} < k$ (threshold), suprimir resultado

**Configuração**:
- $k = 5$ (padrão): Células com menos de 5 registros não são publicadas

**Implementação**:
```typescript
function applyThresholdSuppression<T>(
  data: { value: T; count: number }[],
  threshold: number = 5,
): { value: T; count: number }[] {
  return data.map((item) =>
    item.count < threshold
      ? { value: item.value, count: null, suppressed: true }
      : item,
  );
}

// Exemplo: Propriedades por bairro
const data = [
  { bairro: 'Centro', count: 1500 },
  { bairro: 'Vila Nova', count: 3 }, // Suprimido
  { bairro: 'Jardim', count: 800 },
];

const result = applyThresholdSuppression(data);
console.log(result);
// [
//   { bairro: 'Centro', count: 1500 },
//   { bairro: 'Vila Nova', count: null, suppressed: true },
//   { bairro: 'Jardim', count: 800 }
// ]
```

---

## 📊 Queries Suportadas

### 1. COUNT (Contagem)

**Endpoint**: `GET /public/stats/count`

**Parâmetros**:
- `dataset`: properties, addresses
- `filter`: JSON (ex: `{"bairro": "Centro"}`)
- `epsilon`: Orçamento (default: 0.1)

**Exemplo**:
```
GET /public/stats/count?dataset=properties&filter={"bairro":"Centro"}&epsilon=0.1
```

**Response**:
```json
{
  "query": {
    "dataset": "properties",
    "filter": { "bairro": "Centro" },
    "epsilon": 0.1
  },
  "result": 1523,
  "trueResult": 1500, // (não exposto ao público)
  "budgetRemaining": {
    "epsilon": 0.9,
    "nextReset": "2026-01-01T00:00:00Z"
  },
  "note": "Resultado com ruído Laplace para preservar privacidade"
}
```

---

### 2. SUM (Soma)

**Endpoint**: `GET /public/stats/sum`

**Parâmetros**:
- `dataset`: properties
- `column`: areaTerreno, areaConstruida
- `filter`: JSON
- `epsilon`: Default 0.1

**Exemplo**:
```
GET /public/stats/sum?dataset=properties&column=areaTerreno&filter={"bairro":"Centro"}&epsilon=0.2
```

**Response**:
```json
{
  "query": { ... },
  "result": 685234.5,
  "unit": "m²",
  "budgetRemaining": { ... }
}
```

**Sensibilidade**: Área máxima configurável (ex: 10.000 m² para lote urbano)

---

### 3. MEAN (Média)

**Endpoint**: `GET /public/stats/mean`

**Exemplo**:
```
GET /public/stats/mean?dataset=properties&column=areaTerreno&filter={"bairro":"Centro"}&epsilon=0.1
```

**Response**:
```json
{
  "query": { ... },
  "result": 457.32,
  "unit": "m²",
  "budgetRemaining": { ... }
}
```

---

### 4. HISTOGRAM (Histograma)

**Endpoint**: `GET /public/stats/histogram`

**Parâmetros**:
- `dataset`: properties
- `column`: areaTerreno
- `bins`: Número de faixas (ex: 10)
- `filter`: JSON
- `epsilon`: Default 0.2 (mais ruído pois são múltiplas contagens)

**Exemplo**:
```
GET /public/stats/histogram?dataset=properties&column=areaTerreno&bins=5&epsilon=0.3
```

**Response**:
```json
{
  "query": { ... },
  "result": [
    { "range": "0-200", "count": 345 },
    { "range": "200-400", "count": 678 },
    { "range": "400-600", "count": 423 },
    { "range": "600-800", "count": 189 },
    { "range": "800+", "count": 87 }
  ],
  "budgetRemaining": { ... }
}
```

**Composição de Privacidade**:
- Cada bin consome $\varepsilon / \text{bins}$ do orçamento
- Total: $\varepsilon$ consumido

---

## 💰 Orçamento de Privacidade (Privacy Budget)

### Conceito

**Privacy Budget**: Quantidade limitada de $\varepsilon$ disponível para queries sobre um dataset.

**Por que?**
- Múltiplas queries podem, em conjunto, revelar informações individuais
- Orçamento força limite no número de queries

**Implementação**:

**Tabela**: `privacy_budget`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| dataset_name | VARCHAR | 'properties', 'addresses' |
| epsilon_total | NUMERIC | Orçamento total (ex: 1.0) |
| epsilon_consumed | NUMERIC | Já consumido |
| delta | NUMERIC | Probabilidade de falha (0.00001) |
| reset_period | ENUM | DAILY, WEEKLY, MONTHLY |
| last_reset_at | TIMESTAMPTZ | Último reset |
| next_reset_at | TIMESTAMPTZ | Próximo reset |

**Exemplo**:
```sql
INSERT INTO privacy_budget (dataset_name, epsilon_total, epsilon_consumed, delta, reset_period, next_reset_at)
VALUES ('properties', 1.0, 0.0, 0.00001, 'MONTHLY', '2026-01-01 00:00:00');
```

---

### Consumo de Orçamento

A cada query:
1. Verificar se `epsilon_consumed + query_epsilon <= epsilon_total`
2. Se sim:
   - Executar query com DP
   - Incrementar `epsilon_consumed += query_epsilon`
   - Registrar em `public_queries_log`
3. Se não:
   - Rejeitar query com erro `429 Budget Exhausted`

**Exemplo de rejeição**:
```json
{
  "error": {
    "code": "BUDGET_EXHAUSTED",
    "message": "Privacy budget exhausted for dataset 'properties'",
    "budgetRemaining": 0.0,
    "nextReset": "2026-01-01T00:00:00Z"
  }
}
```

---

### Reset de Orçamento

**Job agendado** (cron):
```typescript
@Cron('0 0 1 * *') // Todo dia 1 do mês às 00:00
async resetPrivacyBudget() {
  const budgets = await this.prisma.privacyBudget.findMany({
    where: {
      reset_period: 'MONTHLY',
      next_reset_at: { lte: new Date() },
    },
  });

  for (const budget of budgets) {
    await this.prisma.privacyBudget.update({
      where: { id: budget.id },
      data: {
        epsilon_consumed: 0,
        last_reset_at: new Date(),
        next_reset_at: this.calculateNextReset(budget.reset_period),
      },
    });
  }

  this.logger.log(`Privacy budget reset for ${budgets.length} datasets`);
}
```

---

## 🔒 Configurações de Privacidade

### Variáveis de Ambiente

```env
# Differential Privacy
DP_DEFAULT_EPSILON=0.1          # Epsilon padrão por query
DP_DEFAULT_DELTA=0.00001        # Delta padrão
DP_MIN_CELL_SIZE=5              # Threshold para supressão
DP_MAX_EPSILON_PER_QUERY=1.0    # Máximo epsilon permitido em uma query
DP_PROPERTIES_TOTAL_BUDGET=1.0  # Orçamento total mensal para dataset 'properties'
DP_ADDRESSES_TOTAL_BUDGET=0.5   # Orçamento total mensal para dataset 'addresses'
DP_MAX_AREA_SENSITIVITY=10000   # Área máxima para cálculo de sensibilidade (m²)
```

---

### Ajuste de Parâmetros

**Trade-off Privacidade vs. Utilidade**:

| Epsilon | Privacidade | Utilidade | Recomendação |
|---------|-------------|-----------|--------------|
| 0.01 | Muito alta | Muito baixa | Dados extremamente sensíveis |
| 0.1 | Alta | Baixa | **Recomendado para dados públicos** |
| 0.5 | Moderada | Moderada | Dados menos sensíveis |
| 1.0 | Baixa | Alta | Publicações internas (não público) |
| 10.0 | Muito baixa | Muito alta | Não recomendado |

**Recomendação para Salesópolis**:
- **Epsilon por query**: 0.1 (padrão)
- **Orçamento mensal**: 1.0 (10 queries/mês)
- **Delta**: $10^{-5}$
- **Threshold**: 5 registros

---

## 📊 Exemplo de Implementação Completa

### Service: `PrivacyService`

```typescript
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrivacyService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async count(
    dataset: string,
    filter: any,
    epsilon: number = this.config.get('DP_DEFAULT_EPSILON', 0.1),
  ) {
    // 1. Verificar orçamento
    await this.checkBudget(dataset, epsilon);

    // 2. Query verdadeira
    const trueCount = await this.getTrueCount(dataset, filter);

    // 3. Aplicar threshold suppression
    if (trueCount < this.config.get('DP_MIN_CELL_SIZE', 5)) {
      throw new HttpException(
        'Result suppressed due to small cell size',
        HttpStatus.FORBIDDEN,
      );
    }

    // 4. Aplicar Laplace noise
    const noisyCount = this.applyLaplaceNoise(trueCount, 1, epsilon);
    const finalCount = Math.max(0, Math.round(noisyCount)); // Não permitir negativo

    // 5. Consumir orçamento
    await this.consumeBudget(dataset, epsilon);

    // 6. Registrar query
    await this.logPublicQuery({
      dataset,
      queryType: 'COUNT',
      queryParams: filter,
      epsilonConsumed: epsilon,
      trueResult: trueCount,
      noisyResult: finalCount,
    });

    // 7. Retornar resultado
    const budgetRemaining = await this.getBudgetRemaining(dataset);

    return {
      query: { dataset, filter, epsilon },
      result: finalCount,
      budgetRemaining,
      note: 'Resultado com ruído Laplace para preservar privacidade',
    };
  }

  private async getTrueCount(dataset: string, filter: any): Promise<number> {
    if (dataset === 'properties') {
      return this.prisma.property.count({ where: filter });
    }
    if (dataset === 'addresses') {
      return this.prisma.digitalAddress.count({ where: filter });
    }
    throw new Error('Invalid dataset');
  }

  private applyLaplaceNoise(
    trueValue: number,
    sensitivity: number,
    epsilon: number,
  ): number {
    const scale = sensitivity / epsilon;
    const u = Math.random() - 0.5;
    const noise = -scale * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
    return trueValue + noise;
  }

  private async checkBudget(dataset: string, epsilon: number): Promise<void> {
    const budget = await this.prisma.privacyBudget.findUnique({
      where: { dataset_name: dataset },
    });

    if (!budget) {
      throw new Error('Budget not configured for dataset');
    }

    if (budget.epsilon_consumed + epsilon > budget.epsilon_total) {
      throw new HttpException(
        {
          code: 'BUDGET_EXHAUSTED',
          message: `Privacy budget exhausted for dataset '${dataset}'`,
          budgetRemaining: budget.epsilon_total - budget.epsilon_consumed,
          nextReset: budget.next_reset_at,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  private async consumeBudget(dataset: string, epsilon: number): Promise<void> {
    await this.prisma.privacyBudget.update({
      where: { dataset_name: dataset },
      data: {
        epsilon_consumed: {
          increment: epsilon,
        },
      },
    });
  }

  private async getBudgetRemaining(dataset: string) {
    const budget = await this.prisma.privacyBudget.findUnique({
      where: { dataset_name: dataset },
    });

    return {
      epsilon: budget.epsilon_total - budget.epsilon_consumed,
      nextReset: budget.next_reset_at,
    };
  }

  private async logPublicQuery(data: any) {
    await this.prisma.publicQueriesLog.create({
      data: {
        dataset_name: data.dataset,
        query_type: data.queryType,
        query_params: data.queryParams,
        epsilon_consumed: data.epsilonConsumed,
        true_result: data.trueResult,
        noisy_result: data.noisyResult,
        ip_address: data.ipAddress,
        user_agent: data.userAgent,
      },
    });
  }
}
```

---

## 🧪 Testes de Privacidade

### 1. Teste de Acurácia

Verificar se o ruído está dentro do esperado:

```typescript
describe('Laplace Noise', () => {
  it('should add noise within expected range', () => {
    const trueValue = 1000;
    const sensitivity = 1;
    const epsilon = 0.1;
    const scale = sensitivity / epsilon; // 10

    const trials = 10000;
    const results = [];

    for (let i = 0; i < trials; i++) {
      const noisy = applyLaplaceNoise(trueValue, sensitivity, epsilon);
      results.push(noisy);
    }

    const mean = results.reduce((a, b) => a + b) / trials;
    const variance = results.reduce((a, b) => a + (b - mean) ** 2, 0) / trials;

    // Laplace: média ≈ trueValue, variância ≈ 2 * scale^2
    expect(mean).toBeCloseTo(trueValue, 0); // Dentro de ±1
    expect(variance).toBeCloseTo(2 * scale ** 2, -1); // ~200
  });
});
```

---

### 2. Teste de Composição

Verificar se orçamento é consumido corretamente:

```typescript
describe('Privacy Budget', () => {
  it('should consume budget correctly', async () => {
    const budget = await prisma.privacyBudget.create({
      data: {
        dataset_name: 'test',
        epsilon_total: 1.0,
        epsilon_consumed: 0.0,
      },
    });

    // Query 1
    await privacyService.count('test', {}, 0.3);
    const after1 = await prisma.privacyBudget.findUnique({ where: { id: budget.id } });
    expect(after1.epsilon_consumed).toBe(0.3);

    // Query 2
    await privacyService.count('test', {}, 0.5);
    const after2 = await prisma.privacyBudget.findUnique({ where: { id: budget.id } });
    expect(after2.epsilon_consumed).toBe(0.8);

    // Query 3 (deve falhar)
    await expect(privacyService.count('test', {}, 0.3)).rejects.toThrow('BUDGET_EXHAUSTED');
  });
});
```

---

## 📖 Próximo Documento

[07-INTEGRACAO.md](07-INTEGRACAO.md) - Formatos e conectores de integração

---

**Última atualização**: 23/12/2025
