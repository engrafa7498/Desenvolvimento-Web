// ==========================================
// CONFIGURAÇÃO DO SUPABASE
// ==========================================

const SUPABASE_URL = "https://saajtswuooqdzirmgpqm.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_rOf3rzEQ4YFr0-RrKz9n0Q_jZJkVAdl";

const WHATSAPP_ANA = "5513997712897";

let supabaseClient = null;
let listaServicos = [];

// ==========================================
// INICIALIZAÇÃO
// ==========================================

document.addEventListener("DOMContentLoaded", iniciarSite);

async function iniciarSite() {
    configurarDataMinima();
    configurarFormulario();
    configurarAtalhosServicos();

    if (!window.supabase) {
        mostrarMensagem("Não foi possível carregar a biblioteca do Supabase.");
        return;
    }

    supabaseClient = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );

    await carregarServicos();
}

// ==========================================
// CARREGAR SERVIÇOS DO BANCO
// ==========================================

async function carregarServicos() {
    const seletor = document.querySelector("#service-select");
    const listaCombos = document.querySelector("#combos-list");

    if (!seletor || !listaCombos) return;

    seletor.innerHTML = '<option value="">Carregando serviços...</option>';
    listaCombos.innerHTML = '<p class="loading-message">Carregando combos...</p>';

    const { data, error } = await supabaseClient
        .from("services")
        .select("id, name, description, price, duration_minutes, service_type")
        .eq("active", true)
        .order("name");

    if (error) {
        console.error("Erro ao carregar serviços:", error.message);

        seletor.innerHTML =
            '<option value="">Não foi possível carregar os serviços</option>';

        listaCombos.innerHTML =
            '<p class="empty-message">Não foi possível carregar os combos. Tente novamente mais tarde.</p>';

        mostrarMensagem(
            "Não foi possível consultar os serviços. Verifique a conexão e as permissões da tabela services."
        );

        return;
    }

    listaServicos = data || [];

    preencherSeletorServicos();
    renderizarCombos();
    atualizarResumoServico();

    console.log("Serviços carregados:", listaServicos.length);
}

// ==========================================
// FORMATAÇÃO DE VALORES
// ==========================================

function formatarPreco(valor) {
    const preco = Number(valor);

    if (!Number.isFinite(preco) || preco <= 0) {
        return "Preço a consultar";
    }

    return preco.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function formatarDuracao(minutos) {
    const total = Number(minutos);

    if (!Number.isFinite(total) || total <= 0) {
        return "Duração a confirmar";
    }

    const horas = Math.floor(total / 60);
    const resto = total % 60;

    if (horas > 0 && resto > 0) {
        return `${horas}h ${resto}min`;
    }

    if (horas > 0) {
        return `${horas}h`;
    }

    return `${resto} min`;
}

// ==========================================
// PREENCHER O SELETOR
// ==========================================

function preencherSeletorServicos() {
    const seletor = document.querySelector("#service-select");

    if (!seletor) return;

    seletor.innerHTML = '<option value="">Selecione um serviço ou combo</option>';

    if (listaServicos.length === 0) {
        seletor.innerHTML =
            '<option value="">Nenhum serviço disponível no momento</option>';
        return;
    }

    const individuais = listaServicos.filter(
        servico => servico.service_type === "individual"
    );

    const combos = listaServicos.filter(
        servico => servico.service_type === "combo"
    );

    adicionarGrupoDeServicos(seletor, "Serviços individuais", individuais);
    adicionarGrupoDeServicos(seletor, "Combos", combos);
}

function adicionarGrupoDeServicos(seletor, titulo, servicos) {
    if (servicos.length === 0) return;

    const grupo = document.createElement("optgroup");
    grupo.label = titulo;

    servicos.forEach(servico => {
        const opcao = document.createElement("option");

        opcao.value = servico.id;
        opcao.textContent =
            `${servico.name} — ${formatarPreco(servico.price)}`;

        grupo.appendChild(opcao);
    });

    seletor.appendChild(grupo);
}

// ==========================================
// MOSTRAR COMBOS
// ==========================================

function renderizarCombos() {
    const container = document.querySelector("#combos-list");

    if (!container) return;

    const combos = listaServicos.filter(
        servico => servico.service_type === "combo"
    );

    container.innerHTML = "";

    if (combos.length === 0) {
        container.innerHTML =
            '<p class="empty-message">Os combos estarão disponíveis em breve.</p>';
        return;
    }

    combos.forEach((combo, index) => {
        const artigo = document.createElement("article");
        artigo.className = "service-card";

        const conteudo = document.createElement("div");
        conteudo.className = "service-content";

        const numero = document.createElement("span");
        numero.className = "service-number";
        numero.textContent = `COMBO ${String(index + 1).padStart(2, "0")}`;

        const titulo = document.createElement("h3");
        titulo.textContent = combo.name;

        const descricao = document.createElement("p");
        descricao.textContent =
            combo.description || "Consulte os detalhes deste combo com a Ana.";

        const preco = document.createElement("p");
        preco.className = "combo-price";

        const precoTexto = document.createElement("strong");
        precoTexto.textContent = formatarPreco(combo.price);
        preco.appendChild(precoTexto);

        const duracao = document.createElement("p");
        duracao.textContent =
            `Duração aproximada: ${formatarDuracao(combo.duration_minutes)}`;

        const link = document.createElement("a");
        link.className = "service-link";
        link.href = "#agendamento";
        link.textContent = "Marcar agendamento →";

        link.addEventListener("click", () => {
            selecionarServico(combo.id);
        });

        conteudo.append(numero, titulo, descricao, preco, duracao, link);
        artigo.appendChild(conteudo);
        container.appendChild(artigo);
    });
}

// ==========================================
// RESUMO DO SERVIÇO SELECIONADO
// ==========================================

function atualizarResumoServico() {
    const seletor = document.querySelector("#service-select");
    const resumo = document.querySelector("#selected-service-info");

    if (!seletor || !resumo) return;

    const servico = listaServicos.find(
        item => item.id === seletor.value
    );

    if (!servico) {
        resumo.textContent =
            "Selecione um serviço para consultar o valor e a duração.";
        return;
    }

    resumo.textContent =
        `Serviço: ${servico.name} | Valor: ${formatarPreco(servico.price)} | Duração: ${formatarDuracao(servico.duration_minutes)}`;
}

function selecionarServico(id) {
    const seletor = document.querySelector("#service-select");

    if (!seletor) return;

    seletor.value = id;
    atualizarResumoServico();
}

// ==========================================
// ATALHOS DOS CARDS DE SERVIÇOS
// ==========================================

function configurarAtalhosServicos() {
    const atalhos = document.querySelectorAll("[data-select-service]");

    atalhos.forEach(atalho => {
        atalho.addEventListener("click", () => {
            const nome = atalho.dataset.selectService;

            const servico = listaServicos.find(item =>
                item.name.toLocaleLowerCase("pt-BR") ===
                nome.toLocaleLowerCase("pt-BR")
            );

            if (servico) {
                selecionarServico(servico.id);
            }
        });
    });

    const seletor = document.querySelector("#service-select");

    if (seletor) {
        seletor.addEventListener("change", atualizarResumoServico);
    }
}

// ==========================================
// DATA MÍNIMA DO AGENDAMENTO
// ==========================================

function configurarDataMinima() {
    const campoData = document.querySelector("#booking-date");

    if (!campoData) return;

    const agora = new Date();
    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, "0");
    const dia = String(agora.getDate()).padStart(2, "0");

    campoData.min = `${ano}-${mes}-${dia}`;
}

// ==========================================
// FORMULÁRIO DE AGENDAMENTO
// ==========================================

function configurarFormulario() {
    const formulario = document.querySelector("#booking-form");

    if (!formulario) return;

    formulario.addEventListener("submit", event => {
        event.preventDefault();

        const nome = document.querySelector("#client-name").value.trim();
        const telefone = document.querySelector("#client-phone").value.trim();
        const servicoId = document.querySelector("#service-select").value;
        const data = document.querySelector("#booking-date").value;
        const horario = document.querySelector("#booking-time").value;

        if (!nome || !telefone || !servicoId || !data || !horario) {
            mostrarMensagem("Preencha todos os campos para continuar.");
            return;
        }

        const servico = listaServicos.find(
            item => item.id === servicoId
        );

        if (!servico) {
            mostrarMensagem("Selecione um serviço válido.");
            return;
        }

        if (!/^[0-9()+\s.-]{8,20}$/.test(telefone)) {
            mostrarMensagem("Confira o número de WhatsApp informado.");
            return;
        }

        const dataEscolhida = new Date(`${data}T${horario}:00`);
        const agora = new Date();

        if (Number.isNaN(dataEscolhida.getTime()) || dataEscolhida <= agora) {
            mostrarMensagem("Escolha uma data e um horário futuros.");
            return;
        }

        const dataFormatada = data.split("-").reverse().join("/");

        const mensagem = [
            "Olá, Ana Karoline! Gostaria de solicitar um agendamento.",
            "",
            `Nome: ${nome}`,
            `WhatsApp do cliente: ${telefone}`,
            `Serviço/Combo: ${servico.name}`,
            `Valor informado no catálogo: ${formatarPreco(servico.price)}`,
            `Duração aproximada: ${formatarDuracao(servico.duration_minutes)}`,
            `Data desejada: ${dataFormatada}`,
            `Horário desejado: ${horario}`,
            "",
            "Se possível, confirme a disponibilidade deste horário, por favor."
        ].join("\n");

        const linkWhatsApp =
            `https://wa.me/${WHATSAPP_ANA}?text=${encodeURIComponent(mensagem)}`;

        mostrarMensagem(
            "Abrindo o WhatsApp para você enviar a solicitação à Ana..."
        );

        window.open(linkWhatsApp, "_blank", "noopener,noreferrer");
    });
}

// ==========================================
// MENSAGENS DO FORMULÁRIO
// ==========================================

function mostrarMensagem(texto) {
    const elemento = document.querySelector("#booking-message");

    if (elemento) {
        elemento.textContent = texto;
    }
}