import { Container } from "@mantine/core";
import config from "../config";

interface ContentContainerProps {
  children: React.ReactNode;
}

// Do we need any media queries here for responsiveness?
const ContentContainer: React.FC<ContentContainerProps> = ({ children }) => (
  <Container size={config.mainContainerSize} p={{ base: "xs", xs: "xs", sm: "xs", md: "md" }}>
    {children}
  </Container>
);

export default ContentContainer;
