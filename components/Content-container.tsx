import { Container } from "@mantine/core";

interface ContentContainerProps {
  children: React.ReactNode;
}

// Do we need any media queries here for responsiveness?
const ContentContainer: React.FC<ContentContainerProps> = ({ children }) => (
  <Container size={1250}>{children}</Container>
);

export default ContentContainer;
