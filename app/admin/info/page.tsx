import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getUserFromCookieHeader } from "@/lib/serverAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const dynamic = "force-dynamic";

export default async function AdminInfoPage() {
  const user = await getUserFromCookieHeader((await headers()).get("cookie"));
  if (!user || user.role !== "admin") redirect("/admin/login");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Информация</h1>
        <p className="text-sm text-muted-foreground">Актуальные данные о компании, юрлице и бренде.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Юридическая информация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Название компании</label>
              <Input defaultValue="ООО КраскаПроф" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">ИНН</label>
              <Input defaultValue="1234567890" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Юридический адрес</label>
              <Input defaultValue="Москва, ул. Профсоюзная 12" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>О компании</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Короткое описание</label>
              <Textarea defaultValue="Мы производим и продаём качественные материалы для интерьера и фасада." />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Слоган</label>
              <Input defaultValue="Цвет, который работает на результат" />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Логотип и бренд</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border-2 border-dashed border-border/70 p-8 text-center text-muted-foreground">
              Перетащите логотип или загрузите файл
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button>Сохранить изменения</Button>
      </div>
    </div>
  );
}
