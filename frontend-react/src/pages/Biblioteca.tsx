import { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ActionIcon, Button, Center, Loader, SimpleGrid, Stack, Text, TextInput, Title } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconBookmark, IconInbox, IconPlus, IconSearch, IconX } from '@tabler/icons-react';
import { useBiblioteca } from '../api/biblioteca';
import { useBusca } from '../api/catalogo';
import { STATUS_LISTA } from '../types/status';
import { JogoCard } from '../components/JogoCard';
import { StatusIcon } from '../components/StatusIcon';

export function Biblioteca() {
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState<number | null>(null);
  const [termo, setTermo] = useState('');
  const [termoDebounced] = useDebouncedValue(termo, 350);

  const { data: itens = [], isLoading } = useBiblioteca();
  const emModoBusca = termoDebounced.trim().length >= 3;
  const { data: resultados = [], isFetching: buscando } = useBusca(termoDebounced);

  const itensFiltrados = useMemo(
    () => (filtro === null ? itens : itens.filter((i) => i.status === filtro)),
    [itens, filtro],
  );

  function contagem(status: number): number {
    return itens.filter((i) => i.status === status).length;
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
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
            <Chip ativo={filtro === null} onClick={() => setFiltro(null)} label="Todos" n={itens.length} />
            {STATUS_LISTA.map((s) => contagem(s.valor) > 0 && (
              <Chip key={s.valor} ativo={filtro === s.valor} onClick={() => setFiltro(s.valor)} label={s.label} n={contagem(s.valor)} status={s.valor} />
            ))}
          </div>

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
                <JogoCard key={uj.id} jogo={uj.jogo} status={uj.status} nota={uj.nota} onClick={() => abrir(uj.jogo.id)} />
              ))}
            </SimpleGrid>
          )}
        </>
      )}
    </Stack>
  );
}

function Chip({ ativo, onClick, label, n, status }: { ativo: boolean; onClick: () => void; label: string; n: number; status?: number }) {
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
      {status !== undefined && <StatusIcon status={status} size={14} />}
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
