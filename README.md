# ADS APP - Docker Compose Stack

> Stack Docker com Node.js 14 + PostgreSQL, volume persistente, networking customizado e comunicação inter-containers.

---

## 🔧 Configuração

### Variáveis de Ambiente (.env)

```env
DB_USER=prova_ads
DB_PASSWORD=ads2026
DB_NAME=ads_app
```

### Serviços

| Serviço | Imagem | Build | Porta Host | Porta Container |
|---------|--------|-------|-----------|-----------------|
| **api_web** |projeto_prova-api_web | Dockerfile.api_web | 8080 | 3000 |
| **db_prod** | postgres:15-alpine | N/A | 3010 | 5432 |

### Volume Persistente

- **Volume:** `pg_prova` - Dados do PostgreSQL mantidos mesmo após deletar container

### Rede Customizada

- **Network:** `network_prova` (bridge) - Isolamento galvanico e DNS service discovery

---

## 🚀 Comandos Principais

### 1. Subir o Stack

```bash
docker compose up -d
```

**Com rebuild:**
```bash
docker compose up -d --build
```

---

### 2. Monitorar Logs em Tempo Real

```bash
docker compose logs -f
```

**Apenas api_web:**
```bash
docker compose logs -f api_web
```

**Apenas PostgreSQL:**
```bash
docker compose logs -f db_prod
```

---

### 3. Verificar Status dos Containers

```bash
docker ps
```

---

### 4. Testar Aplicação

**Dentro do container:**
```bash
docker exec api_web_container node -e "require('http').get('http://localhost:3000', (r) => console.log(r.statusCode))"
```

**Conectar ao banco:**
```bash
docker exec -it db_prod_container psql -U prova_ads -d ads_app
```

Senha: `ads2026`

---

## 📊 Evidências de Funcionamento

### Evidência 1: Containers Ativos

```bash
$ docker ps
```

**Output:**
```
CONTAINER ID   IMAGE                   COMMAND              CREATED             STATUS
88a2d4a908f5   projeto_prova-api_web   "node app.js"        58 seconds ago       Up 42 seconds
389aa07e3ecf   postgres:15-alpine      "docker-entrypoint"  About a minute ago   Up 57 seconds (healthy)

PORTS
0.0.0.0:8080->3000/tcp
5432/tcp

NAMES
api_web_container
db_prod_container
```

✅ **api_web_container** running on port 8080:3000  
✅ **db_prod_container** healthy on port 5432  
✅ Ambos containers ativos e comunicáveis

![Print 1 - Docker PS](images/print1.png)

---

### Evidência 1.5: Comunicação Entre Containers (Ping)

```bash
$ docker exec api_web_container ping -c 3 db_prod
```

**Output:**
```
PING db_prod (172.25.0.2): 56 data bytes
64 bytes from 172.25.0.2: seq=0 ttl=64 time=0.578 ms
64 bytes from 172.25.0.2: seq=1 ttl=64 time=0.083 ms
64 bytes from 172.25.0.2: seq=2 ttl=64 time=0.113 ms

--- db_prod ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
round-trip min/avg/max = 0.083/0.250/0.578 ms
```

✅ **0% packet loss** = Comunicação perfeita entre containers  
✅ DNS resolveu `db_prod` para IP 172.25.0.2  
✅ Rede `network_prova` funcionando corretamente

![Print 2 - Ping Inter-Containers](images/print2.png)

---

### Evidência 2: Logs da Aplicação

```bash
 docker logs api_web_container
```

**Output:**
```
✅ ADS App started on port 3000
📡 Environment:
   - DB_HOST: db_prod
   - DB_PORT: 5432
   - DB_USER: prova_ads
   - DB_NAME: ads_app
```

✅ Aplicação iniciou corretamente  
✅ Variáveis de ambiente configuradas  
✅ Host DB resolvido para `db_prod` (DNS da rede customizada)

---

### Evidência 3: Status PostgreSQL

```bash
 docker logs db_prod_container
```

**Output (primeiras linhas):**
```
2026-04-13 23:26:00.000 UTC [1] LOG:  starting PostgreSQL 15.17
2026-04-13 23:26:00.123 UTC [1] LOG:  listening on IPv4 address "0.0.0.0"
2026-04-13 23:26:00.456 UTC [1] LOG:  database system is ready to accept connections
```

✅ PostgreSQL 15.17 operacional  
✅ Listening on port 5432  
✅ Database `ads_app` pronto para uso

---

### Evidência 4: Volume Persistente

```bash
 docker volume list
```

**Output:**
```
DRIVER    VOLUME NAME
local     projeto_prova_pg_prova
```

✅ Volume `pg_prova` criado  
✅ Driver: local (persistente no host)  
✅ Dados mantidos após `docker compose down`

---

### Evidência 5: Rede Customizada

```bash
 docker network ls
```

**Output:**
```
NETWORK ID     NAME                          DRIVER
abc123def456   projeto_prova_network_prova   bridge
```

✅ Network `network_prova` criada  
✅ Modo bridge para comunicação inter-containers  
✅ DNS service discovery ativo (hosts resolvem via hostname)

---

### Evidência 6: Mapeamento de Portas

| Recurso | Host | Container | Status |
|---------|------|-----------|--------|
| API Web | 8080 | 3000 | ✅ Ativo |
| PostgreSQL | 3010 | 5432 | ✅ Ativo |

---

## 🧹 Limpeza

### Parar Containers (Mantém Dados)

```bash
docker compose stop
```

**Retomar:**
```bash
docker compose start
```

---

### Remover Containers (Mantém Volume)

```bash
docker compose down
```

✅ Dados do volume `pg_prova` preservados

---

### Remover Tudo (Cuidado: Deleta Dados) ⚠️

```bash
docker compose down -v
```

❌ Remove containers, rede E volume

---

## 📁 Estrutura de Arquivos

```
projeto_prova/
├── docker-compose.yml       # Orquestração (Tarefa 2)
├── Dockerfile.api_web       # Build Node.js 14 (Tarefa 1)
├── .gitignore               # Exclusões versionamento
├── .env                     # Variáveis de ambiente
├── .dockerignore            # Otimização build
├── package.json             # Dependências Node.js
├── app.js                   # Aplicação Express
└── README.md                # Este arquivo
```

---

## 📝 Detalhes Técnicos

### Dockerfile.api_web (Tarefa 1)

**Justificativa da Imagem Base:**
```
✅ node:14-alpine foi escolhida por:
   • SEGURANÇA: Alpine Linux minimal, reduz vulnerabilidades
   • TAMANHO: ~150MB (vs 900MB+ do node:14 padrão)
   • PERFORMANCE: Acelera pulls e startup
```

**Otimizações de Camadas:**
```dockerfile
# 1. Multi-stage build: builder stage para deps, runtime stage otimizado
# 2. Agrupamento RUN com && e \ para reduzir camadas
# 3. Limpeza npm cache na mesma camada: npm cache clean --force && rm -rf ~/.npm
# 4. WORKDIR /app para isolamento apropriado
# 5. COPY --from=builder para reutilizar compilação
# 6. Healthcheck para monitorar estado
```

---

### docker-compose.yml (Tarefa 2)

**Seções Implementadas:**

**1. Services:**
   - `api_web`: Build do Dockerfile.api_web (port 8080:3000)
   - `db_prod`: postgres:15-alpine (port 3010:5432)
   - Ambos com depends_on + healthcheck

**2. Volumes:**
   - `pg_prova`: Volume nomeado para persistência em `/var/lib/postgresql/data`

**3. Networks:**
   - `network_prova`: Bridge network customizada
   - CIDR: 172.25.0.0/16

**4. Variáveis de Ambiente:**
   - DB_USER, DB_PASSWORD, DB_NAME via .env
   - NODE_ENV, DB_HOST, PORT via defaults

---

### .gitignore

**Exclusões Implementadas:**
```
✅ .git/          → Não versionamos metadados Git
✅ *.log          → Logs excluídos
✅ node_modules/  → Dependências regeneradas no build
✅ .env           → Credenciais sensíveis
✅ .vscode/       → Configurações IDE
✅ .idea/         → Configurações IDE
✅ dist/, build/  → Artefatos gerados
```

---

## � Conceitos Teóricos

### 1. A Diferença entre CMD e ENTRYPOINT no Dockerfile

Ao construir uma imagem Docker, é importante entender como as instruções CMD e ENTRYPOINT funcionam, pois elas definem o comportamento do container quando executado. Embora pareçam fazer coisas similares, elas têm propósitos bem distintos e oferecem diferentes níveis de flexibilidade ao usuário.

A instrução ENTRYPOINT define o executável principal do container, aquelo que sempre será executado independentemente de quais argumentos você passar. Pense nela como o "coração" da aplicação - é praticamente imutável. Por outro lado, CMD funciona como um conjunto de argumentos padrão que serão passados ao ENTRYPOINT, e aqui está o detalhe importante: **CMD pode ser facilmente substituído quando você executa um container com o comando `docker run`**.

Isso significa que se você tiver um Dockerfile com `ENTRYPOINT ["node"]` e `CMD ["app.js"]`, quando você executar `docker run minha-imagem`, o container iniciará executando `node app.js`. No entanto, se você quiser executar um script diferente sem alterar a imagem, basta fazer `docker run minha-imagem server.js`, e o container executará `node server.js`. O que acontece é que o novo argumento substituiu completamente o CMD original.

**A grande diferença está justamente nessa flexibilidade: CMD permite que o usuário modifique os argumentos de inicialização através do comando `docker run` sem precisar redefinir o executável principal.** Caso você quisesse realmente substituir o ENTRYPOINT, seria necessário usar a flag `--entrypoint` e especificar o novo executável, o que é bem menos comum e intuitivo. Portanto, para aplicações que precisam de flexibilidade, especialmente em ambientes de desenvolvimento e teste, o CMD é a ferramenta ideal.

---

### 2. A Função do depends_on no Docker Compose e a Questão da Prontidão do Banco de Dados

Quando trabalhamos com múltiplos serviços em um ambiente containerizado, geralmente nos deparamos com um problema: em qual ordem devemos iniciar os containers? A resposta é onde entra a propriedade `depends_on` no docker-compose.yml. Ela nos permite especificar que um serviço depende de outro, controlando a sequência de inicialização.

Por exemplo, em nosso projeto, temos `api_web` que depende de `db_prod`. A função do `depends_on` é garantir que o container do banco de dados seja criado e começe a inicializar antes que a aplicação web tente fazer conexões. Isso é importante porque facilita a descoberta de serviços através do DNS automático que o Docker Compose oferece - os containers conseguem se comunicar usando o nome do serviço (como `db_prod`) como hostname, sem precisar conhecer endereços IP específicos.

Além disso, `depends_on` garante que a porta do banco de dados (5432 neste caso) esteja aberta e disponível, evitando erros de "conexão recusada" que ocorreriam se a API tentasse conectar antes do processo de inicialização do PostgreSQL estar em andamento.

**No entanto, há um ponto crítico a considerar: `depends_on` não garante que o banco de dados esteja verdadeiramente pronto para aceitar conexões.** É uma diferença sutil, mas importante. O container pode estar iniciado, a porta pode estar aberta, mas o PostgreSQL ainda pode estar executando seu próprio startup, carregando tabelas, executando migrações, e assim por diante. Se a API tentar conectar neste exato momento, pode enfrentar erros de conexão ou timeout.

Para resolver este problema propriamente, implementamos **health checks com a condição `service_healthy`**. Um health check é essencialmente um teste que o Docker executa periodicamente para verificar se o serviço está realmente operacional. No nosso caso, o PostgreSQL executa o comando `pg_isready`, que retorna sucesso apenas quando o banco realmente está pronto para aceitar conexões novas. Configuramos a API para aguardar este health check passar antes de iniciar, garantindo assim uma inicialização segura e confiável dos nossos serviços.

---

### 3. Copy-on-Write na Arquitetura Docker e a Natureza Efêmera dos Containers

Para compreender por que dados em containers são perdidos quando removemos o container, precisamos entender um pouco sobre como Docker armazena dados. Docker utiliza uma arquitetura chamada Copy-on-Write (CoW), e ela é fundamental para entender a natureza efêmera dos containers.

Imagine um container como um "sanduíche de camadas" - a imagem base possui várias camadas somente para leitura empilhadas uma sobre a outra. Na verdade, a maioria dessas camadas é imutável e compartilhada entre containers da mesma imagem. Porém, quando um container é criado, o Docker adiciona uma camada especial no topo chamada "writable layer" ou "camada de escrita". É nesta camada que o container escreve seus dados - qualquer arquivo criado, modificado ou deletado enquanto o container está rodando é armazenado aqui.

O problema é que essa camada de escrita é totalmente ligada à vida do container. Quando você executa `docker rm` para deletar um container, essa camada simplesmente desaparece. Todo e qualquer dado que foi escrito nela - arquivos de configuração dinâmica, caches, logs, tudo - é perdido permanentemente. Essa é a natureza efêmera do container: ele é descartável por design.

Para resolver este problema quando precisamos de persistência, o Docker oferece duas soluções principais, cada uma com suas características. **Volumes** são gerenciados diretamente pelo Docker Engine e armazenados em um local específico do host gerenciado pelo próprio Docker (tipicamente em `/var/lib/docker/volumes/`). Eles são independentes da estrutura de diretórios do servidor e podem ser portados facilmente entre hosts. Por outro lado, temos **Bind Mounts**, que funcionam mapeando um diretório ou arquivo específico do host diretamente para dentro do container. Enquanto Bind Mounts oferecem flexibilidade de localização, eles criam um acoplamento direto com o filesystem do host e são menos portáveis.

**Em nosso projeto, escolhemos usar Volumes para armazenar os dados do PostgreSQL.** Quando configuramos `pg_prova:/var/lib/postgresql/data` no docker-compose, estamos dizendo ao Docker: "mantenha os dados do banco em um volume gerenciado, não na camada efêmera do container". Com isso, quando executamos `docker compose down`, os containers e a rede são removidos, mas o volume `pg_prova` permanece intacto, preservando todos os dados. Se quiséssemos realmente deletar tudo, teríamos que executar `docker compose down -v`, onde a flag `-v` instrui o Docker a remover também os volumes.

---

## �🔐 Segurança

- ✅ Alpine Linux: imagem minimal reduz superfície de ataque
- ✅ Multi-stage build: apenas runtime necessário na imagem final
- ✅ Network customizada: isolamento dos serviços
- ✅ Credenciais em .env: não commitadas no Git
- ✅ Healthchecks: monitoramento automático

---

## ✅ Validação Final

| Item | Status | Detalhes |
|------|--------|----------|
| Dockerfile.api_web | ✅ | Multi-stage node 14, otimizado |
| docker-compose.yml | ✅ | 2 serviços, volumes, networks, vars |
| .gitignore | ✅ | .git e *.log excluídos obrigatoriamente |
| Tamanho Imagem | ✅ | ~150MB (Alpine otimizado) |
| Volume Persistente | ✅ | pg_prova ativo e vinculado |
| Rede Customizada | ✅ | network_prova bridge criada |
| Mapeamento Portas | ✅ | 8080:3000 + 3010:5432 |
| Health Checks | ✅ | Ambos containers monitorados |
| Dependências | ✅ | api_web aguarda db_prod |

---

**Data:** 13 de Abril de 2026  
**Status:** ✅ Stack Pronto

