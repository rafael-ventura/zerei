import { Anchor, Text } from '@mantine/core';

/** Exigência do ToS da RAWG free tier: backlink visível onde os dados aparecem. */
export function RawgAttribution() {
  return (
    <Text size="xs" c="dimmed" ta="center" py="md">
      Dados de jogos por{' '}
      <Anchor href="https://rawg.io" target="_blank" rel="noopener noreferrer" size="xs">
        RAWG.io
      </Anchor>
    </Text>
  );
}
