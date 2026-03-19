# TODOs do projeto Buy Together Enhanced

## Prioridade alta

- [ ] Adicionar a logica de seletor de quantidade tanto no `CurrentProduct` quanto no `ProductsList`.
- [ ] Melhorar o visual do `customText` para ficar mais dinamico e mais agradavel.
- [ ] Na logica de preco, mostrar nativamente o `DE/POR` quando o desconto ja vier do produto (sem precisar aplicar manualmente via Site Editor).
- [ ] Na logica de preco, aplicar desconto de cupom automaticamente ao carregar a PDP, criando/recriando o `DE/POR` com base no desconto validado via `orderForm` ou API.
- [ ] Revisar o alerta de link/build no `vtex link`:
  - `vendors~BuyTogether.js (428 KiB)` acima do limite recomendado de asset (warning de performance).
  - Avaliar code splitting/lazy loading (`import()`), reducao de dependencias e/ou separacao de responsabilidades para diminuir bundle.

## Outros TODOs identificados no projeto

- [ ] Documentacao visual do componente: adicionar prints e/ou GIFs do Buy Together em uso (storefront e/ou Site Editor), para facilitar onboarding e referencia.
- [ ] Criação de adapatação CSS minima para mobile dentro do componente - para facilitar os ajustes para serem minimos no Store Theme.