import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ActionIcon, Badge, Button, Center, Checkbox, Group, Loader, Modal, NumberInput, Select,
  Stack, Text, Textarea, Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconArrowLeft, IconBookmark, IconDeviceGamepad2, IconHeart, IconHeartFilled, IconInfoCircle, IconPlayerPlay,
  IconPlus, IconStarFilled, IconTrash,
} from '@tabler/icons-react';
import { useJogo, usePlataformas } from '../api/catalogo';
import {
  useAdicionarJogatina, usePorJogo, useRemoverDaBiblioteca, useRemoverJogatina, useAtualizarBiblioteca, useMarcar,
  type NovaJogatina,
} from '../api/biblioteca';
import { extractError } from '../api/client';
import { StatusIcon } from '../components/StatusIcon';
import { STATUS_LISTA, StatusJogo } from '../types/status';
import { corMetacritic, corNota5, corNota10 } from '../utils/nota';

const DEZ = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const ICONE_STATUS: Record<number, React.ReactNode> = {
  [StatusJogo.QueroJogar]: <IconBookmark size={16} />,
  [StatusJogo.Jogando]: <IconPlayerPlay size={16} />,
  [StatusJogo.Jogado]: <IconDeviceGamepad2 size={16} />,
};

function corFundo(nome: string): string {
  let h = 0;
  for (let i = 0; i < nome.length; i++) h = nome.charCodeAt(i) + ((h << 5) - h);
  const hue = Math.abs(h) % 360;
  return `linear-gradient(150deg, hsl(${hue}, 45%, 30%), hsl(${(hue + 40) % 360}, 42%, 16%))`;
}

function formRejogadaVazio(): NovaJogatina {
  return { plataformaId: null, ano: null, horas: null, status: StatusJogo.Jogado, ehRejogada: true, observacao: '' };
}

export function JogoDetalhe() {
  const { id } = useParams<{ id: string }>();
  const jogoId = Number(id);
  const navigate = useNavigate();

  const { data: jogo, isLoading } = useJogo(jogoId);
  const { data: plataformas = [] } = usePlataformas();
  const { data: ujServidor } = usePorJogo(jogoId);

  const [uj, setUj] = useState(ujServidor ?? null);
  const [resenha, setResenha] = useState('');
  const [horasLocal, setHorasLocal] = useState<number | ''>('');

  const [dialogRejogadaAberto, setDialogRejogadaAberto] = useState(false);
  const [formRejogada, setFormRejogada] = useState<NovaJogatina>(formRejogadaVazio());

  const [confirmZerarAberto, setConfirmZerarAberto] = useState(false);
  const [horasConfirm, setHorasConfirm] = useState<number | ''>('');
  const [tambemPlatinei, setTambemPlatinei] = useState(false);

  const marcar = useMarcar();
  const atualizar = useAtualizarBiblioteca();
  const adicionarJogatina = useAdicionarJogatina();
  const removerJogatina = useRemoverJogatina();
  const removerDaBiblioteca = useRemoverDaBiblioteca();

  const principal = uj?.jogatinas.find((j) => !j.ehRejogada) ?? null;
  const rejogadas = uj?.jogatinas.filter((j) => j.ehRejogada) ?? [];

  useEffect(() => {
    setUj(ujServidor ?? null);
    setResenha(ujServidor?.resenha ?? '');
    setHorasLocal(ujServidor?.jogatinas.find((j) => !j.ehRejogada)?.horas ?? '');
  }, [ujServidor]);

  function erro(e: unknown) {
    notifications.show({ color: 'red', title: 'Ops', message: extractError(e, 'Algo deu errado.') });
  }

  async function definirStatus(status: number) {
    try {
      const novo = uj
        ? await atualizar.mutateAsync({ usuarioJogoId: uj.id, body: { status } })
        : await marcar.mutateAsync({ jogoId, status });
      setUj(novo);
      setResenha(novo.resenha ?? '');
    } catch (e) {
      erro(e);
    }
  }

  async function salvarPlataforma(plataformaId: number | null) {
    if (!uj) return;
    try {
      const novo = await atualizar.mutateAsync({ usuarioJogoId: uj.id, body: { plataformaId: plataformaId ?? undefined } });
      setUj(novo);
    } catch (e) {
      erro(e);
    }
  }

  async function salvarHoras() {
    if (!uj || horasLocal === principal?.horas) return;
    try {
      const novo = await atualizar.mutateAsync({ usuarioJogoId: uj.id, body: { horas: horasLocal === '' ? undefined : horasLocal } });
      setUj(novo);
    } catch (e) {
      erro(e);
    }
  }

  async function toggleZerado(checked: boolean) {
    if (!uj) return;
    if (checked && !principal?.horas) {
      setHorasConfirm('');
      setTambemPlatinei(false);
      setConfirmZerarAberto(true);
      return;
    }
    try {
      const novo = await atualizar.mutateAsync({ usuarioJogoId: uj.id, body: { zerado: checked, platinado: checked ? undefined : false } });
      setUj(novo);
    } catch (e) {
      erro(e);
    }
  }

  async function confirmarZerado() {
    if (!uj) return;
    try {
      const novo = await atualizar.mutateAsync({
        usuarioJogoId: uj.id,
        body: { zerado: true, platinado: tambemPlatinei, horas: horasConfirm === '' ? undefined : horasConfirm },
      });
      setUj(novo);
      setHorasLocal(novo.jogatinas.find((j) => !j.ehRejogada)?.horas ?? '');
      setConfirmZerarAberto(false);
    } catch (e) {
      erro(e);
    }
  }

  async function togglePlatinado(checked: boolean) {
    if (!uj) return;
    try {
      const novo = await atualizar.mutateAsync({ usuarioJogoId: uj.id, body: { platinado: checked } });
      setUj(novo);
    } catch (e) {
      erro(e);
    }
  }

  async function toggleAbandonado(checked: boolean) {
    if (!uj) return;
    try {
      const novo = await atualizar.mutateAsync({ usuarioJogoId: uj.id, body: { abandonado: checked, zerado: checked ? false : undefined, platinado: checked ? false : undefined } });
      setUj(novo);
    } catch (e) {
      erro(e);
    }
  }

  async function toggleFavorito() {
    if (!uj) return;
    try {
      setUj(await atualizar.mutateAsync({ usuarioJogoId: uj.id, body: { favorito: !uj.favorito } }));
    } catch (e) {
      erro(e);
    }
  }

  async function setNota(n: number) {
    if (!uj) return;
    try {
      setUj(await atualizar.mutateAsync({ usuarioJogoId: uj.id, body: { nota: n } }));
    } catch (e) {
      erro(e);
    }
  }

  async function salvarResenha() {
    if (!uj || (uj.resenha ?? '') === resenha) return;
    try {
      setUj(await atualizar.mutateAsync({ usuarioJogoId: uj.id, body: { resenha } }));
    } catch (e) {
      erro(e);
    }
  }

  function abrirDialogRejogada() {
    setFormRejogada(formRejogadaVazio());
    setDialogRejogadaAberto(true);
  }

  async function salvarRejogada() {
    if (!uj) return;
    try {
      const jt = await adicionarJogatina.mutateAsync({ usuarioJogoId: uj.id, body: { ...formRejogada, ehRejogada: true } });
      setUj({ ...uj, jogatinas: [...uj.jogatinas, jt] });
      setDialogRejogadaAberto(false);
    } catch (e) {
      erro(e);
    }
  }

  async function onRemoverJogatina(jogatinaId: number) {
    if (!uj) return;
    try {
      await removerJogatina.mutateAsync(jogatinaId);
      setUj({ ...uj, jogatinas: uj.jogatinas.filter((x) => x.id !== jogatinaId) });
    } catch (e) {
      erro(e);
    }
  }

  async function onRemoverDaBiblioteca() {
    if (!uj) return;
    try {
      await removerDaBiblioteca.mutateAsync(uj.id);
      setUj(null);
    } catch (e) {
      erro(e);
    }
  }

  if (isLoading) return <Center mih={300}><Loader /></Center>;
  if (!jogo) return null;

  return (
    <Stack gap="lg">
      <Button variant="subtle" color="gray" leftSection={<IconArrowLeft size={16} />} onClick={() => navigate(-1)} w="fit-content" px={0}>
        Voltar
      </Button>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 280px) 1fr', gap: 36 }}>
        <div style={{ position: 'sticky', top: 90, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--mantine-color-dark-4)', aspectRatio: '3/4', height: 'fit-content' }}>
          {jogo.capaUrl ? (
            <img src={jogo.capaUrl} alt={jogo.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 18, textAlign: 'center', background: corFundo(jogo.nome) }}>
              <Text fw={800} fz={20} c="white">{jogo.nome}</Text>
            </div>
          )}
        </div>

        <div>
          <Title order={1}>{jogo.nome}</Title>
          <Group gap={8} mt="sm" mb={4}>
            {jogo.ano && <Text c="dimmed">{jogo.ano}</Text>}
            {jogo.generos.map((g) => <Badge key={g} variant="light">{g}</Badge>)}
            {!!jogo.metacritic && (
              <Badge
                variant="filled"
                styles={{ root: { backgroundColor: corMetacritic(jogo.metacritic), color: '#111' } }}
              >
                Metacritic {jogo.metacritic}
              </Badge>
            )}
            {!!jogo.notaComunidade && (
              <Badge
                variant="filled"
                leftSection={<IconStarFilled size={11} />}
                styles={{ root: { backgroundColor: corNota5(jogo.notaComunidade), color: '#111' } }}
              >
                RAWG {jogo.notaComunidade.toFixed(1)}
                {!!jogo.notaComunidadeContagem && ` (${jogo.notaComunidadeContagem})`}
              </Badge>
            )}
            {!!uj?.nota && (
              <Badge
                variant="filled"
                leftSection={<IconStarFilled size={11} />}
                styles={{ root: { backgroundColor: corNota10(uj.nota), color: '#111' } }}
              >
                Sua nota {uj.nota}
              </Badge>
            )}
          </Group>

          {jogo.plataformasDisponiveis.length > 0 && (
            <Group gap={6} mb={4}>
              <Text size="xs" c="dimmed">Lançado em:</Text>
              {jogo.plataformasDisponiveis.map((p) => <Badge key={p} variant="outline" size="sm">{p}</Badge>)}
            </Group>
          )}

          {jogo.tempoMedioHoras && (
            <Text size="xs" c="dimmed" mb={4}>Tempo médio da comunidade pra zerar: {jogo.tempoMedioHoras}h</Text>
          )}

          {jogo.dlcs.length > 0 && (
            <Group gap={6} mt={4}>
              <Text size="xs" c="dimmed">DLCs:</Text>
              {jogo.dlcs.map((d) => (
                <Badge key={d.id} variant="dot" size="sm" style={{ cursor: 'pointer' }} onClick={() => navigate(`/jogo/${d.id}`)}>
                  {d.nome}
                </Badge>
              ))}
            </Group>
          )}

          <Stack gap={10} mt="xl">
            <Text fw={700}>Status</Text>
            <Group gap={10}>
              {STATUS_LISTA.map((s) => (
                <button
                  key={s.valor}
                  onClick={() => definirStatus(s.valor)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 9,
                    background: uj?.status === s.valor ? `${s.cor}26` : 'var(--mantine-color-dark-6)',
                    border: `1px solid ${uj?.status === s.valor ? s.cor : 'var(--mantine-color-dark-4)'}`,
                    color: 'var(--mantine-color-white)', borderRadius: 12, padding: '12px 16px',
                    fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  {ICONE_STATUS[s.valor]} {s.label}
                </button>
              ))}
            </Group>
          </Stack>

          {uj ? (
            <>
              <Group mt="xl" gap="md" align="flex-end">
                <Select
                  label="Plataforma que você jogou"
                  placeholder="Selecione"
                  searchable
                  w={220}
                  data={plataformas.map((p) => ({ value: String(p.id), label: p.nome }))}
                  value={principal?.plataformaId != null ? String(principal.plataformaId) : null}
                  onChange={(v) => salvarPlataforma(v ? Number(v) : null)}
                />
                <NumberInput
                  label="Horas jogadas"
                  placeholder="ex: 40"
                  w={140}
                  value={horasLocal}
                  onChange={(v) => setHorasLocal(v === '' ? '' : Number(v))}
                  onBlur={salvarHoras}
                />
              </Group>

              <Group mt="lg" gap="xl">
                <Checkbox
                  label="Zerei"
                  checked={uj.zerado}
                  onChange={(e) => toggleZerado(e.currentTarget.checked)}
                />
                <Checkbox
                  label="Platinei"
                  disabled={!uj.zerado}
                  checked={uj.platinado}
                  onChange={(e) => togglePlatinado(e.currentTarget.checked)}
                />
                <Checkbox
                  label="Abandonei"
                  checked={uj.abandonado}
                  onChange={(e) => toggleAbandonado(e.currentTarget.checked)}
                />
              </Group>

              <Group mt="xl" gap={40} align="flex-start">
                <div>
                  <Text fw={700} mb={10}>Sua nota</Text>
                  <Group gap={5}>
                    {DEZ.map((n) => (
                      <button
                        key={n}
                        onClick={() => setNota(n)}
                        style={{
                          width: 30, height: 34, borderRadius: 8,
                          background: (uj.nota ?? 0) >= n ? '#f5c518' : 'var(--mantine-color-dark-6)',
                          border: `1px solid ${(uj.nota ?? 0) >= n ? '#f5c518' : 'var(--mantine-color-dark-4)'}`,
                          color: (uj.nota ?? 0) >= n ? '#1a1a1a' : 'var(--mantine-color-dimmed)',
                          cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit',
                        }}
                      >
                        {n}
                      </button>
                    ))}
                    {!!uj.nota && (
                      <Button variant="subtle" color="gray" size="compact-xs" onClick={() => setNota(0)}>limpar</Button>
                    )}
                  </Group>
                </div>
                <div>
                  <Text fw={700} mb={10}>Favorito</Text>
                  <ActionIcon
                    size={50}
                    radius={12}
                    variant={uj.favorito ? 'light' : 'default'}
                    color={uj.favorito ? 'red' : 'gray'}
                    onClick={toggleFavorito}
                  >
                    {uj.favorito ? <IconHeartFilled size={20} /> : <IconHeart size={20} />}
                  </ActionIcon>
                </div>
              </Group>

              <Stack gap={10} mt="xl">
                <Text fw={700}>Resenha</Text>
                <Textarea
                  minRows={3}
                  autosize
                  placeholder="O que você achou desse jogo?"
                  value={resenha}
                  onChange={(e) => setResenha(e.currentTarget.value)}
                  onBlur={salvarResenha}
                />
              </Stack>

              <Stack gap={14} mt="xl">
                <Group justify="space-between">
                  <Text fw={700}>Rejogadas</Text>
                  <Button variant="subtle" size="compact-sm" leftSection={<IconPlus size={14} />} onClick={abrirDialogRejogada}>
                    Registrar rejogada
                  </Button>
                </Group>

                {rejogadas.length === 0 ? (
                  <Text c="dimmed" size="sm">Nenhuma rejogada registrada ainda.</Text>
                ) : (
                  <Stack gap={10}>
                    {rejogadas.map((jt) => (
                      <Group key={jt.id} gap={13} p={14} style={{ background: 'var(--mantine-color-dark-7)', border: '1px solid var(--mantine-color-dark-4)', borderRadius: 12 }}>
                        <Center w={36} h={36} style={{ borderRadius: 9, background: 'var(--mantine-color-dark-5)', flexShrink: 0 }}>
                          <StatusIcon status={jt.status} zerado={jt.zerado} platinado={jt.platinado} abandonado={jt.abandonado} size={18} />
                        </Center>
                        <div style={{ flex: 1 }}>
                          <Text size="sm" fw={600}>{jt.plataforma || 'Plataforma não informada'}</Text>
                          <Text size="xs" c="dimmed">
                            {jt.ano ? `${jt.ano}` : ''}
                            {jt.horas ? ` · ${jt.horas}h` : ''}
                            {jt.zerado ? ' · zerou' : ''}
                            {jt.platinado ? ' · platinou' : ''}
                            {jt.abandonado ? ' · abandonou' : ''}
                          </Text>
                        </div>
                        <ActionIcon variant="subtle" color="gray" onClick={() => onRemoverJogatina(jt.id)}>
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    ))}
                  </Stack>
                )}
              </Stack>

              <Button color="red" variant="light" leftSection={<IconTrash size={16} />} mt="lg" onClick={onRemoverDaBiblioteca}>
                Remover da biblioteca
              </Button>
            </>
          ) : (
            <Group gap={8} mt="xl" c="dimmed">
              <IconInfoCircle size={18} />
              <Text size="sm">Escolha um status acima para adicionar este jogo à sua biblioteca.</Text>
            </Group>
          )}
        </div>
      </div>

      <Modal opened={dialogRejogadaAberto} onClose={() => setDialogRejogadaAberto(false)} title="Registrar rejogada" centered>
        <Stack>
          <Select
            label="Plataforma"
            placeholder="Selecione"
            searchable
            data={plataformas.map((p) => ({ value: String(p.id), label: p.nome }))}
            value={formRejogada.plataformaId != null ? String(formRejogada.plataformaId) : null}
            onChange={(v) => setFormRejogada((f) => ({ ...f, plataformaId: v ? Number(v) : null }))}
          />
          <Group grow>
            <NumberInput label="Ano" placeholder="2024" value={formRejogada.ano ?? ''} onChange={(v) => setFormRejogada((f) => ({ ...f, ano: v === '' ? null : Number(v) }))} />
            <NumberInput label="Horas" placeholder="40" value={formRejogada.horas ?? ''} onChange={(v) => setFormRejogada((f) => ({ ...f, horas: v === '' ? null : Number(v) }))} />
          </Group>
          <Checkbox
            label="Zerou de novo"
            checked={!!formRejogada.zerado}
            onChange={(e) => setFormRejogada((f) => ({ ...f, zerado: e.currentTarget.checked, platinado: e.currentTarget.checked ? f.platinado : false }))}
          />
          <Checkbox
            label="Platinou de novo"
            disabled={!formRejogada.zerado}
            checked={!!formRejogada.platinado}
            onChange={(e) => setFormRejogada((f) => ({ ...f, platinado: e.currentTarget.checked }))}
          />
          <Group justify="flex-end" mt="sm">
            <Button variant="subtle" color="gray" onClick={() => setDialogRejogadaAberto(false)}>Cancelar</Button>
            <Button onClick={salvarRejogada} loading={adicionarJogatina.isPending}>Salvar</Button>
          </Group>
        </Stack>
      </Modal>

      <Modal opened={confirmZerarAberto} onClose={() => setConfirmZerarAberto(false)} title="Zerar jogo" centered>
        <Stack>
          <NumberInput
            label="Quantas horas você levou? (opcional)"
            placeholder="ex: 40"
            value={horasConfirm}
            onChange={(v) => setHorasConfirm(v === '' ? '' : Number(v))}
          />
          <Checkbox
            label="Também platinei"
            checked={tambemPlatinei}
            onChange={(e) => setTambemPlatinei(e.currentTarget.checked)}
          />
          <Group justify="flex-end" mt="sm">
            <Button variant="subtle" color="gray" onClick={() => setConfirmZerarAberto(false)}>Cancelar</Button>
            <Button onClick={confirmarZerado} loading={atualizar.isPending}>Salvar</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
