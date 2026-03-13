## Development Log

### 2026-03-10

- **Internationalization messages aligned**
  - Alinhadas as mensagens de `buy-together` entre todos os arquivos em `messages/` (`pt.json`, `en.json`, `es.json` e `context.json`).
  - Adicionadas/atualizadas as chaves:
    - `admin/editor.buy-together.discountPercentage.title`
    - `admin/editor.buy-together.discountPercentage.description` (incluindo instrução clara para nunca deixar vazio e usar `0` quando não houver desconto)
    - `admin/editor.buy-together.customText.title`
    - `admin/editor.buy-together.customText.description`
    - `admin/editor.buy-together.showCustomText.title`
    - `admin/editor.buy-together.showCustomText.description`
  - Garantido que todos os arquivos compartilham o mesmo conjunto de chaves, com traduções coerentes em PT/EN/ES e fallback em `context.json`.

- **Schema do componente BuyTogether**
  - Ajustada a descrição do campo `discountPercentage` no schema de `BuyTogether` para deixar explícito o intervalo aceito e o comportamento ao usar `0`:
    - Campo: `discountPercentage`
    - Local: `react/BuyTogether.tsx` (`BuyTogetherWrapper.schema.properties.discountPercentage.description`)
    - Nova descrição: enfatiza que o valor deve estar entre 0 e 100 e que `0` significa “não aplicar desconto”.

- **Mensagens estáticas para o React Builder**
  - Criado arquivo de mensagens de i18n isolado para o app:
    - Arquivo: `react/intlMessages.ts`
    - Conteúdo: declaração estática via `defineMessages` das seguintes IDs:
      - `admin/editor.buy-together.title`
      - `admin/editor.buy-together.description`
      - `admin/editor.buy-together.discountPercentage.title`
      - `admin/editor.buy-together.discountPercentage.description`
      - `admin/editor.buy-together.customText.title`
      - `admin/editor.buy-together.customText.description`
      - `admin/editor.buy-together.showCustomText.title`
      - `admin/editor.buy-together.showCustomText.description`
      - `admin/editor.buy-together.installments-list-item.title`
  - Import realizado em `react/BuyTogether.tsx`:
    - Adicionada linha: `import './intlMessages'`
    - Objetivo: garantir que o builder consiga parsear estaticamente todas as mensagens usadas pelo app, eliminando o warning de “React builder could not parse automatically all messages in your code” e melhorando a performance de build/renderização.

- **TODOs deste chat (todos concluídos)**
  - Atualizar `en.json` com todas as chaves de `pt.json` (traduções em inglês) para o bloco `buy-together`.
  - Atualizar `es.json` com todas as chaves de `pt.json` (traduções em espanhol) para o bloco `buy-together`.
  - Revisar e alinhar `context.json` com o mesmo conjunto de chaves de `pt.json`, usando inglês como fallback.
  
### 2026-03-10 (chat atual)

- **Revisão de defaults do componente BuyTogether**
  - Confirmado que o texto personalizado (`customText`) utiliza `"PIX"` como valor padrão:
    - Props do componente: `customText = 'PIX'` em `react/BuyTogether.tsx`.
    - Schema do componente: `default: 'PIX'` em `BuyTogetherWrapper.schema.properties.customText`.
    - Contexto padrão: `customText: 'PIX'` em `react/Context.ts`.
  - Confirmado que a flag de exibição de texto personalizado (`showCustomText`) vem habilitada por padrão no schema:
    - `showCustomText.default = true` em `BuyTogetherWrapper.schema.properties.showCustomText`.
  - Confirmado que o `discountPercentage`:
    - Usa `discountPercentage = 0` como default nas props do componente (`react/BuyTogether.tsx`).
    - Usa `default: 7` apenas no schema (`BuyTogetherWrapper.schema.properties.discountPercentage`) e não em nenhum outro ponto do projeto.
  - Decisão de produto/estrutura: o valor padrão desejado no schema passa a ser `0`, alinhado com o comportamento das props e com a descrição que indica que `0` significa “não aplicar desconto”.

### TODOs deste chat (todos concluídos)

- **Atualizar schema do `discountPercentage`**: mudar `default: 7` para `default: 0` em `react/BuyTogether.tsx` (`BuyTogetherWrapper.schema.properties.discountPercentage`), garantindo consistência entre:
  - default das props do componente (`discountPercentage = 0`), e
  - default exposto no Site Editor (schema).

---

### 2026-03-11 (chat atual)

- **Correção de dependência de `product-summary`**
  - `manifest.json` já continha `vtex.product-summary: 2.x`, mas o erro de build indicava interface não encontrada por causa do uso de `product-summary` em `store/interfaces.json` e `store/blocks.json`.
  - Confirmado que o app usa `product-summary` apenas via dependência direta (`vtex.product-summary`), e que o erro estava ligado à resolução de interfaces no momento do build anterior (0.5.0).

- **Refino da estrutura de blocos e interfaces**
  - `store/blocks.json`:
    - Mantida a estrutura de:
      - `buy-together-current-product` → `product-summary.shelf` (produto atual).
      - `buy-together-product-list` → `product-summary.shelf` (produto sugerido).
    - Removido o bloco de título (`buy-together-title`) da hierarquia visual para simplificar o card final.
  - `store/interfaces.json`:
    - Mantidas as interfaces principais:
      - `buy-together` (componente raiz `BuyTogether`).
      - `buy-together-current-product`, `buy-together-product-list`, `buy-together-total`, `buy-together-installments`, `buy-together-buy-button`, `buy-together-message`, `buy-together-discount`.
    - Removida a interface `buy-together-title` (descontinuada).

- **Comportamento do Product Summary (produto atual e lista)**
  - `react/CurrentProduct.tsx`:
    - Renderiza o produto base via `<ExtensionPoint id="product-summary" product={normalizedBaseProduct} />`.
  - `react/ProductsList.tsx`:
    - Usa `normalizedProductList` e renderiza apenas o primeiro item da lista:
      - `<ExtensionPoint id="product-summary" product={normalizedProductList[0]} />`.
    - Confirmado que, embora o cross-selling possa retornar vários SKUs, a UI atual mostra apenas o primeiro.

- **Lógica de cross-sell vs SKU manual**
  - `react/BuyTogether.tsx`:
    - Adicionadas novas props ao componente:
      - `useManualSku?: boolean` — alternador para escolher entre fluxo de cross-sell padrão e SKU manual.
      - `manualSkuId?: string` — SKU único a ser usado como produto sugerido quando `useManualSku` está habilitado.
    - Implementada lógica no `useEffect` que calcula `showTogetherIds`:
      - Quando `useManualSku` = `true`:
        - Se `manualSkuId` estiver preenchido e for numérico, `showTogetherIds = [Number(manualSkuId)]`.
        - Caso contrário, `showTogetherIds = []`.
      - Quando `useManualSku` = `false` (padrão):
        - Mantido o comportamento original de buscar SKUs de cross-sell via:
          - `GET /api/catalog_system/pub/products/crossselling/showtogether/{product.productId}`.
    - Mantido o fluxo de normalização:
      - `getProducts.gql` → `productsByIdentifier` → `ProductSummary.mapCatalogProductToProductSummary(...)` → `normalizedProductList`.
  - `BuyTogetherWrapper.schema` (no mesmo arquivo):
    - Adicionados campos configuráveis no Site Editor:
      - `useManualSku` (`boolean`, default `false`).
      - `manualSkuId` (`string`).

- **Ajustes na mensagem e valor total do Compre Junto**
  - `react/Value.tsx`:
    - Simplificado para exibir apenas:
      - O valor total formatado com `<FormattedCurrency value={simplifiedTotalPrice} />`.
      - Um texto personalizado opcional ao lado do valor:
        - Lido do contexto (`customText`), condicionado por `showCustomText`.
    - Removido o texto fixo anterior (`"Por apenas: {totalPrice}"`) e o uso de `IOMessageWithMarkers`.
  - `react/Message.tsx`:
    - Transformado em `StorefrontFunctionComponent` com suporte a:
      - `message?: ReactNode`.
      - `children?: ReactNode`.
    - Ordem de prioridade para o conteúdo:
      - `children` do bloco `buy-together-message`.
      - Prop `message` do próprio bloco `buy-together-message`.
      - `message` vindo do contexto (`BuyTogetherContext` — configurado no bloco raiz `BuyTogether`).
      - Fallback estático: `"Compre o conjunto por:"`.
    - Alterada a marcação HTML para um heading:
      - Em vez de `<div className={handles.buyTogetherInfo}>`, passou a renderizar:
        - `<h2 className={handles.buyTogetherInfo}>{content}</h2>`.
      - Objetivo: melhorar SEO garantindo um heading para a seção de “Compre junto”.
    - Atualizado o schema do bloco `buy-together-message`:
      - Propriedade `message` com `default: "Compre o conjunto por:"`.

- **Propagação da mensagem via contexto**
  - `react/Context.ts`:
    - `BuyTogetherContextProps` passou a incluir:
      - `message?: string`.
    - `BuyTogetherContextDefault` inicializa `message` como `undefined`.
  - `react/BuyTogether.tsx`:
    - O componente `BuyTogether` agora aceita a prop `message?: string` (mensagem configurável no bloco raiz).
    - Valor default da prop `message` definido como `"Compre o conjunto por:"`.
    - O valor de `message` é repassado ao contexto:
      - `BuyTogetherContext.Provider` inclui `message` em seu `value`.
  - `BuyTogetherWrapper.schema`:
    - Adicionada propriedade:
      - `message` (`string`, default `"Compre o conjunto por:"`), permitindo configurar o texto diretamente no Site Editor no nível do bloco `BuyTogether`.

- **Ordem dos campos no Site Editor para o componente BuyTogether**
  - `BuyTogetherWrapper.schema.properties` foi reorganizado para refletir a seguinte ordem:
    1. `message`
    2. `useManualSku`
    3. `manualSkuId`
    4. `showCustomText`
    5. `customText`
    6. `discountPercentage`
  - Motivação:
    - Dar mais destaque à mensagem (heading) e ao modo de seleção de SKU (manual vs cross-sell) antes de opções mais avançadas de preço.

### TODOs deste chat (todos concluídos)

- **Documentar no README** (ou em outro arquivo de docs de uso) os novos comportamentos do componente `BuyTogether`:
  - Explicar o alternador `useManualSku` e o uso de `manualSkuId`.
  - Explicar como a mensagem é configurada:
    - Campo `message` no bloco raiz `BuyTogether`.
    - Bloco `buy-together-message` como heading (`<h2>`) com prioridade sobre a mensagem do contexto quando configurado com `children` ou `message` próprio.
  - Atualizar exemplos de configuração de blocos (`store-theme`) para incluir:
    - `buy-together-message` dentro de `flex-layout.col#buyTogetherInformation`.

- **Garantir traduções corretas dos campos no Site Editor**:
  - Revisar o mapeamento de mensagens para os campos `discountPercentage`, `customText` e `showCustomText` do schema `BuyTogetherWrapper` (`react/BuyTogether.tsx`), conferindo se:
    - Os IDs usados no schema batem exatamente com os IDs definidos em `react/intlMessages.ts`.
    - As mesmas chaves existem e estão traduzidas em `messages/pt.json`, `messages/en.json`, `messages/es.json` e `messages/context.json`.
  - Testar no Site Editor se os rótulos passam a exibir as traduções em vez dos IDs e, se necessário, forçar limpeza de cache/builder na conta para validar.

### 2026-03-12 (chat atual)

- **Correção de erro de domínio de mensagens no build da VTEX**
  - Erro observado durante o `vtex link`:
    - `No domains were found for messages: editor.buy-together.title`, `editor.buy-together.description`, `editor.buy-together.discountPercentage.title`, `editor.buy-together.discountPercentage.description`, `editor.buy-together.customText.title`, `editor.buy-together.customText.description`, `editor.buy-together.showCustomText.title`, `editor.buy-together.showCustomText.description`.
    - Mensagem complementar do builder: `Please add a domain before the message id like "store/<message.id>" or "admin/<message.id>".`
  - Causa raiz:
    - As mensagens usadas para rotular campos no Site Editor estavam definidas sem domínio (`editor.buy-together.*`), o que passou a ser rejeitado pelo builder `react@3.x`.

- **Ajuste de domínio das mensagens de editor para `admin/`**
  - Arquivos atualizados: `messages/pt.json`, `messages/en.json`, `messages/es.json`, `messages/context.json`.
  - Alterações principais:
    - `editor.buy-together.title` → `admin/editor.buy-together.title`
    - `editor.buy-together.description` → `admin/editor.buy-together.description`
    - `editor.buy-together.discountPercentage.title` → `admin/editor.buy-together.discountPercentage.title`
    - `editor.buy-together.discountPercentage.description` → `admin/editor.buy-together.discountPercentage.description`
    - `editor.buy-together.customText.title` → `admin/editor.buy-together.customText.title`
    - `editor.buy-together.customText.description` → `admin/editor.buy-together.customText.description`
    - `editor.buy-together.showCustomText.title` → `admin/editor.buy-together.showCustomText.title`
    - `editor.buy-together.showCustomText.description` → `admin/editor.buy-together.showCustomText.description`
  - Mantidas como estavam (já corretas):
    - Mensagens `admin/editor.buy-together.installments.*`.
    - Mensagem `store/buy-together.installments.default`.

- **Alinhamento do código React com os novos IDs**
  - Arquivo `react/intlMessages.ts` atualizado para refletir o novo domínio:
    - IDs agora usam o prefixo `admin/editor.buy-together.*`, garantindo consistência com os arquivos de mensagens e com o requirement do builder.

- **Atualização da documentação interna**
  - `docs/README.md`:
    - Atualizados os exemplos de mensagens para referenciar `admin/editor.buy-together.*` em vez de `editor.buy-together.*`.
  - `docs/DEVELOPMENT_LOG.md`:
    - Registradas as mudanças de domínio e o erro original de build, para futura referência em debugging e manutenção.

### 2026-03-12 (chat atual) — Modo lista de produtos sugeridos

- **Alternador de lista de produtos sugeridos**
  - Adicionada a prop `showListMode?: boolean` ao componente `BuyTogether` em `react/BuyTogether.tsx`.
  - Novo campo no schema `BuyTogetherWrapper.schema.properties.showListMode`:
    - Título: "Exibir lista de produtos sugeridos?"
    - Tipo: `boolean`.
    - Default: `false`, mantendo o comportamento anterior (apenas 1 item sugerido).
  - A prop é propagada via contexto (`react/Context.ts` e `BuyTogetherContext`) para o componente `react/ProductsList.tsx`.

- **Prioridade do SKU manual sobre o cross-sell**
  - O contexto `BuyTogetherContextProps` agora expõe `useManualSku: boolean` e `showListMode: boolean`.
  - Em `react/ProductsList.tsx`, quando `useManualSku === true`, o modo lista é ignorado:
    - Mesmo que `showListMode` esteja habilitado, o componente renderiza apenas um produto (SKU manual), respeitando a prioridade do fluxo manual sobre o cross-sell.

- **Lista de cross-sell com limite e randomização**
  - Em `react/ProductsList.tsx`:
    - Definida constante `MAX_LIST_ITEMS = 8` para limitar a quantidade máxima de produtos exibidos na lista de cross-sell, evitando impactos de performance.
    - Implementada função de randomização (Fisher–Yates) sobre uma cópia de `normalizedProductList`, seguida de `slice(0, MAX_LIST_ITEMS)`.
  - A lista somente é randomizada e limitada quando:
    - `showListMode === true` **e**
    - `useManualSku === false` (modo cross-sell ativo).
  - Quando não há cross-sell configurado para o produto, o modo lista aproveita os itens vindos do contexto de grupo de produto, respeitando o mesmo limite de 8 itens.

- **Estabilidade visual da lista (evitar reembaralhamento constante)**
  - A lista de itens a serem renderizados (`itemsToRender`) passou a ser calculada com `React.useMemo`:
    - Dependências: `normalizedProductList`, `showListMode`, `useManualSku`.
    - Resultado: a randomização ocorre apenas quando os dados ou flags mudam, evitando que os produtos "troquem" incessantemente a cada re-render.

### TODOs pendentes

- [ ] **Documentação visual do componente**: adicionar prints e/ou GIFs exemplificando o componente Buy Together em uso (storefront e/ou Site Editor), para facilitar onboarding e referência na documentação.
