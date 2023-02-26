import { Card, Group, Text, Badge, Container } from "@mantine/core";

/**
 * TODO Please improve the error component / make the border red or something
 * @param title
 * @param body
 * @constructor
 */
const ErrorCard = ({ title, body }: { title: string; body: string }) => {
  const renderTitle = title || "Error";
  const defaultBody = body || "There was an error rendering this component.";

  return (
    <Container size={"sm"} p={"md"}>
      <Card p="lg" radius="md" withBorder>
        <Group position="apart" mb="xs">
          <Text weight={500}>{renderTitle}</Text>
          <Badge color="pink">ERROR</Badge>
        </Group>

        <Text>{defaultBody}</Text>
      </Card>
    </Container>
  );
};

export default ErrorCard;
