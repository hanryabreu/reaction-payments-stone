# Plugin para o Reaction Commerce do Stone Gateway

Este é um plugin do Reaction Commerce para o Stone Gateway, usando a API RESTful disponibilizada pela Stone Pagamentos.

**ATENÇÃO!!**
Plugin em desenvolvimento e testes. **NÃO USE PARA AMBIENTES DE PRODUÇÃO**.

## Para instalar
Abra o terminal no diretório do seu projeto e entre com os comandos:

    cd ./imports/plugins/custom
    git clone https://github.com/hanryabreu/reaction-payments-stone.git

De volta para a raíz do diretório do seu projeto, execute:

    reaction reset -n && reaction
    
Isto provavalmente fará o plugin funcionar em sua loja.

## Transações a serem implementadas
- Pagamentos via boleto bancário
- Pagamentos com débito online
- Sistema Antifraude Stone
- Pagamentos em recorrência

## Transações em implementação
- Pagamentos com cartão de crédito (auth, capture and refund)
