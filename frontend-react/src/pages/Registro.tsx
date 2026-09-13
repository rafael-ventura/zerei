import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Anchor, Button, Center, Paper, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useAuth } from '../context/AuthContext';
import { extractError } from '../api/client';

export function Registro() {
  const { registrar } = useAuth();
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function criar() {
    if (!username || !email || !senha) {
      notifications.show({ color: 'yellow', title: 'Atenção', message: 'Preencha usuário, e-mail e senha.' });
      return;
    }
    setCarregando(true);
    try {
      await registrar(nome, username, email, senha);
      navigate('/onboarding');
    } catch (e) {
      notifications.show({ color: 'red', title: 'Ops', message: extractError(e, 'Não foi possível criar a conta.') });
    } finally {
      setCarregando(false);
    }
  }

  return (
    <Center mih="100vh">
      <Paper withBorder radius="md" p="xl" w={380}>
        <Stack gap="xs" mb="lg">
          <Title order={2}>
            zerei<Text span c="blue">.</Text>
          </Title>
          <Text c="dimmed" size="sm">Crie sua conta e comece a montar sua biblioteca.</Text>
        </Stack>
        <Stack>
          <TextInput label="Nome" placeholder="Seu nome" value={nome} onChange={(e) => setNome(e.currentTarget.value)} />
          <TextInput
            label="Usuário"
            placeholder="seu_usuario"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.currentTarget.value)}
          />
          <TextInput
            label="E-mail"
            type="email"
            placeholder="voce@email.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
          />
          <PasswordInput
            label="Senha"
            placeholder="mínimo 6 caracteres"
            autoComplete="new-password"
            value={senha}
            onChange={(e) => setSenha(e.currentTarget.value)}
            onKeyDown={(e) => e.key === 'Enter' && criar()}
          />
          <Button fullWidth loading={carregando} onClick={criar}>Criar conta</Button>
          <Text size="sm" ta="center">
            Já tem conta? <Anchor component={Link} to="/login">Entrar</Anchor>
          </Text>
        </Stack>
      </Paper>
    </Center>
  );
}
