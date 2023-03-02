import { Container } from "@mantine/core";

export interface ContentContainerProps {
  children: React.ReactNode;
}

export const ContentContainer: React.FC<ContentContainerProps> = ({ children }) => (
  <Container size={1250}>{children}</Container>
);
