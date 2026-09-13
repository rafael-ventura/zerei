import { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ActionIcon, Button, Center, Loader, Select, SimpleGrid, Stack, Text, TextInput, Title,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconBookmark, IconInbox, IconPlus, IconSearch, IconX } from '@tabler/icons-react';
import { useBiblioteca } from '../api/biblioteca';
import { useBusca } from '../api/catalogo';
import { StatusJogo } from '../types/status';
import type { UsuarioJogo } from '../types/models';
import { JogoCard } from '../components/JogoCard';
import { StatusIcon } from '../components/StatusIcon';
import { somarHoras } from '../utils/jogo';

type FiltroStatus = 'todos' | 'querojogar' | 'jogando' | 'jogado' | 'zerado' | 'platinado' | 'abandonado';
type Ordenacao = 'recente' | 'mais-jogado' | 'nome';

const FILTROS: { valor: FiltroStatus; label: string; status?: number; zerado?: boolean; platinado?: boolean; abandonado?: boolean }[] = [
  { valor: 'querojogar', label: 'Quero jogar', status: StatusJogo.QueroJogar },
  { valor: 'jogando', label: 'Jogando', status: StatusJogo.Jogando },
  { valor: 'jogado', label: 'Jogado', status: StatusJogo.Jogado },
  { valor: 'zerado', label: 'Zerados', status: StatusJogo.Jogado, zerado: true },
  { valor: 'platinado', label: 'Platinados', status: StatusJogo.Jogado, zerado: true, platinado: true },
  { valor: 'abandonado', label: 'Abandonados', status: StatusJogo.Jogado, abandonado: true },
];

function aplicaFiltroStatus(uj: UsuarioJogo, filtro: FiltroStatus): boolean {
  switch (filtro) {
    case 'todos': return true;
    case 'querojogar': return uj.status === StatusJogo.QueroJogar;
    case 'jogando': return uj.status === StatusJogo.Jogando;
    case 'jogado': return uj.status === StatusJogo.Jogado && !uj.zerado && !uj.abandonado;
    case 'zerado': return uj.zerado;
    case 'platinado': return uj.platinado;
    case 'abandonado': return uj.abandonado;
  }
}

export function Biblioteca() {
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState<FiltroStatus>('todos');
  const [plataformaFiltro, setPlataformaFiltro] = useState<string | null>(null);
  const [ordenacao, setOrdenacao] = useState<Ordenacao>('recente');
  const [termo, setTermo] = useState('');
  const [termoDebounced] = useDebouncedValue(termo, 350);

  const { data: itens = [], isLoading } = useBiblioteca();
  const emModoBusca = termoDebounced.trim().length >= 3;
  const { data: resultados = [], isFetching: buscando } = useBusca(termoDebounced);

  const plataformasJogadas = useMemo(() => {
    const nomes = new Set<string>();
    itens.forEach((uj) => uj.jogatinas.forEach((jt) => jt.plataforma && nomes.add(jt.plataforma)));
    return Array.from(nomes).sort();
  }, [itens]);

  const itensFiltrados = useMemo(() => {
    let lista = itens.filter((uj) => aplicaFiltroStatus(uj, filtro));
    if (plataformaFiltro) {
      lista = lista.filter((uj) => uj.jogatinas.some((jt) => jt.plataforma === plataformaFiltro));
    }
    if (ordenacao === 'mais-jogado') {
      lista = [...lista].sort((a, b) => somarHoras(b) - somarHoras(a));
    } else if (ordenacao === 'nome') {
      lista = [...lista].sort((a, b) => a.jogo.nome.localeCompare(b.jogo.nome));
    }
    // 'recente' já é a ordem que a API devolve (por AtualizadoEm desc) — não precisa reordenar.
    return lista;
  }, [itens, filtro, plataformaFiltro, ordenacao]);

  function contagem(filtro: FiltroStatus): number {
    return itens.filter((uj) => aplicaFiltroStatus(uj, filtro)).length;
  }

  function abrir(jogoId: number) {
    navigate(`/jogo/${jogoId}`);
  }

  return (
    <Stack gap="lg">
      <div>
        <Title order={1}>Minha biblioteca</Title>
        <Text c="dimmed" size="sm" mt={6}>
          {itens.length} {itens.length === 1 ? 'jogo' : 'jogos'} na sua estante
        </Text>
      </div>

      <TextInput
        placeholder="Buscar e adicionar um jogo…"
        leftSection={<IconSearch size={16} />}
        value={termo}
        onChange={(e) => setTermo(e.currentTarget.value)}
        rightSection={
          buscando ? <Loader size="xs" /> : termo.length > 0 ? (
            <ActionIcon variant="subtle" onClick={() => setTermo('')}>
              <IconX size={16} />
            </ActionIcon>
          ) : null
        }
      />

      {emModoBusca ? (
        <div>
          <Text fw={700} mb="md">Resultados</Text>
          {resultados.length === 0 && !buscando ? (
            <EstadoVazio icon={<IconInbox size={40} />} texto={`Nenhum jogo encontrado para "${termo}".`} />
          ) : (
            <SimpleGrid cols={{ base: 3, sm: 4, md: 6 }} spacing="md">
              {resultados.map((j) => (
                <JogoCard key={j.id} jogo={j} onClick={() => abrir(j.id)} />
              ))}
            </SimpleGrid>
          )}
        </div>
      ) : (
        <>
          <Stack gap="sm">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
              <Chip ativo={filtro === 'todos'} onClick={() => setFiltro('todos')} label="Todos" n={itens.length} />
              {FILTROS.map((f) => contagem(f.valor) > 0 && (
                <Chip
                  key={f.valor}
                  ativo={filtro === f.valor}
                  onClick={() => setFiltro(f.valor)}
                  label={f.label}
                  n={contagem(f.valor)}
                  status={f.status}
                  zerado={f.zerado}
                  platinado={f.platinado}
                  abandonado={f.abandonado}
                />
              ))}
            </div>

            {plataformasJogadas.length > 0 && (
              <Select
                placeholder="Filtrar por plataforma"
                w={220}
                clearable
                data={plataformasJogadas}
                value={plataformaFiltro}
                onChange={setPlataformaFiltro}
              />
            )}

            <Select
              label="Ordenar por"
              w={220}
              data={[
                { value: 'recente', label: 'Jogados recentemente' },
                { value: 'mais-jogado', label: 'Mais jogados (horas)' },
                { value: 'nome', label: 'Nome (A-Z)' },
              ]}
              value={ordenacao}
              onChange={(v) => setOrdenacao((v as Ordenacao) ?? 'recente')}
              allowDeselect={false}
            />
          </Stack>

          {isLoading ? (
            <Center mih={200}><Loader /></Center>
          ) : itens.length === 0 ? (
            <EstadoVazio icon={<IconBookmark size={40} />} texto="Sua biblioteca está vazia.">
              <Button component={Link} to="/onboarding" leftSection={<IconPlus size={16} />} mt="md">
                Adicionar jogos
              </Button>
            </EstadoVazio>
          ) : (
            <SimpleGrid cols={{ base: 3, sm: 4, md: 6 }} spacing="md">
              {itensFiltrados.map((uj) => (
                <JogoCard
                  key={uj.id}
                  jogo={uj.jogo}
                  status={uj.status}
                  zerado={uj.zerado}
                  platinado={uj.platinado}
                  abandonado={uj.abandonado}
                  nota={uj.nota}
                  horas={somarHoras(uj)}
                  onClick={() => abrir(uj.jogo.id)}
                />
              ))}
            </SimpleGrid>
          )}
        </>
      )}
    </Stack>
  );
}

function Chip({
  ativo, onClick, label, n, status, zerado, platinado, abandonado,
}: {
  ativo: boolean; onClick: () => void; label: string; n: number;
  status?: number; zerado?: boolean; platinado?: boolean; abandonado?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        background: ativo ? 'var(--mantine-color-dark-4)' : 'var(--mantine-color-dark-6)',
        border: `1px solid ${ativo ? 'var(--mantine-color-blue-5)' : 'var(--mantine-color-dark-4)'}`,
        borderRadius: 999,
        padding: '8px 14px',
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
        fontFamily: 'inherit',
      }}
    >
      {status !== undefined && <StatusIcon status={status} zerado={zerado} platinado={platinado} abandonado={abandonado} size={14} />}
      {label}
      <span style={{ background: 'var(--mantine-color-dark-8)', borderRadius: 999, padding: '1px 8px', fontSize: 12, color: 'var(--mantine-color-dimmed)' }}>
        {n}
      </span>
    </button>
  );
}

function EstadoVazio({ icon, texto, children }: { icon: React.ReactNode; texto: string; children?: React.ReactNode }) {
  return (
    <Center mih={200}>
      <Stack align="center" gap={6}>
        <div style={{ opacity: 0.5 }}>{icon}</div>
        <Text c="dimmed">{texto}</Text>
        {children}
      </Stack>
    </Center>
  );
}
