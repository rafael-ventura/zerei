import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Center, Group, Loader, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconArrowLeft, IconArrowRight } from '@tabler/icons-react';
import { useFamosos, useGeneros } from '../api/catalogo';
import { useMarcarLote } from '../api/biblioteca';
import { StatusJogo } from '../types/status';
import { JogoCard } from '../components/JogoCard';

export function Onboarding() {
  const navigate = useNavigate();
  const [passo, setPasso] = useState<1 | 2>(1);
  const [generosSel, setGenerosSel] = useState<Set<string>>(new Set());
  const [jogosSel, setJogosSel] = useState<Set<number>>(new Set());

  const { data: generos = [] } = useGeneros();
  const { data: jogos = [], isLoading } = useFamosos();
  const marcarLote = useMarcarLote();

  const jogosFiltrados = useMemo(() => {
    if (generosSel.size === 0) return jogos;
    return jogos.filter((j) => j.generos.some((g) => generosSel.has(g)));
  }, [jogos, generosSel]);

  function toggleGenero(nome: string) {
    setGenerosSel((prev) => {
      const s = new Set(prev);
      s.has(nome) ? s.delete(nome) : s.add(nome);
      return s;
    });
  }

  function toggleJogo(id: number) {
    setJogosSel((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  }

  function pular() {
    navigate('/biblioteca');
  }

  async function finalizar() {
    const ids = [...jogosSel];
    if (ids.length === 0) {
      navigate('/biblioteca');
      return;
    }
    try {
      await marcarLote.mutateAsync({ jogoIds: ids, status: StatusJogo.Jogado });
      navigate('/biblioteca');
    } catch {
      notifications.show({ color: 'red', title: 'Ops', message: 'Não foi possível salvar agora.' });
    }
  }

  return (
    <Stack gap="xl" maw={980} mx="auto">
      <Group>
        <Title order={2} style={{ flex: 0 }}>
          zerei<Text span c="blue">.</Text>
        </Title>
        <Group gap={8} style={{ flex: 1 }} justify="center">
          <span style={{ width: 36, height: 5, borderRadius: 3, background: passo >= 1 ? 'var(--mantine-color-blue-5)' : 'var(--mantine-color-dark-4)' }} />
          <span style={{ width: 36, height: 5, borderRadius: 3, background: passo >= 2 ? 'var(--mantine-color-blue-5)' : 'var(--mantine-color-dark-4)' }} />
        </Group>
        <Button variant="subtle" color="gray" onClick={pular}>Pular</Button>
      </Group>

      {passo === 1 ? (
        <Stack gap="lg">
          <div>
            <Title order={1}>Quais gêneros você curte?</Title>
            <Text c="dimmed" mt={10}>Escolha alguns pra gente te mostrar os jogos certos. (opcional)</Text>
          </div>
          <Group gap={10}>
            {generos.map((g) => (
              <Button
                key={g.id}
                radius="xl"
                variant={generosSel.has(g.nome) ? 'filled' : 'default'}
                onClick={() => toggleGenero(g.nome)}
              >
                {g.nome}
              </Button>
            ))}
          </Group>
          <Group justify="flex-end">
            <Button rightSection={<IconArrowRight size={16} />} onClick={() => setPasso(2)}>Continuar</Button>
          </Group>
        </Stack>
      ) : (
        <Stack gap="lg">
          <div>
            <Title order={1}>Marque o que você já jogou</Title>
            <Text c="dimmed" mt={10}>Toque nas capas dos jogos que já passaram pela sua vida. Isso já monta sua biblioteca.</Text>
          </div>

          {isLoading ? (
            <Center mih={200}><Loader /></Center>
          ) : (
            <SimpleGrid cols={{ base: 3, sm: 4, md: 6 }} spacing="md">
              {jogosFiltrados.map((j) => (
                <JogoCard key={j.id} jogo={j} selecionado={jogosSel.has(j.id)} onClick={() => toggleJogo(j.id)} />
              ))}
            </SimpleGrid>
          )}

          <Group justify="space-between" mt="lg">
            <Button variant="subtle" color="gray" leftSection={<IconArrowLeft size={16} />} onClick={() => setPasso(1)}>
              Voltar
            </Button>
            <Button onClick={finalizar} loading={marcarLote.isPending}>
              {jogosSel.size > 0 ? `Adicionar ${jogosSel.size} jogos` : 'Finalizar'}
            </Button>
          </Group>
        </Stack>
      )}
    </Stack>
  );
}
