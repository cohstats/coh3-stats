import { Alert, Button, Container, Stack, Text } from "@mantine/core";

export const DpsDataError = ({ onRetry }: { onRetry: () => void }) => (
  <Container size="md" my="md">
    <Alert color="red" title="Unable to load DPS data">
      <Stack align="flex-start" gap="sm">
        <Text size="sm">Please try again.</Text>
        <Button onClick={onRetry}>Retry</Button>
      </Stack>
    </Alert>
  </Container>
);
