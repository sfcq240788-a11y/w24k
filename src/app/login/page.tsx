import { LoginForm } from "./LoginForm";
import { COMPRA_EN_LINEA_HABILITADA } from "@/lib/features";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const resolvedParams = await searchParams;
  return (
    <LoginForm
      resolvedParams={resolvedParams}
      compraHabilitada={COMPRA_EN_LINEA_HABILITADA}
    />
  );
}
