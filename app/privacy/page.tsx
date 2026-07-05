import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Политика конфиденциальности",
  description:
    "Политика обработки персональных данных ООО «КраскаПроф» в соответствии с ФЗ-152.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-6">
      <h1 className="font-heading text-3xl font-bold mb-2">
        Политика конфиденциальности
      </h1>
      <p className="text-sm text-muted-foreground mb-8">
        Последнее обновление: 1 июня 2026 г.
      </p>

      <div className="prose prose-sm max-w-none flex flex-col gap-6 text-foreground leading-relaxed">
        <section>
          <h2 className="font-heading text-xl font-bold mb-3">
            1. Общие положения
          </h2>
          <p>
            ООО «КраскаПроф» (ИНН 7701234567, ОГРН 1157746000000, далее —
            «Оператор») обязуется обеспечить безопасность персональных данных
            пользователей сайта kraskaprof.ru в соответствии с Федеральным
            законом от 27 июля 2006 г. № 152-ФЗ «О персональных данных».
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-bold mb-3">
            2. Цели обработки персональных данных
          </h2>
          <p>Оператор обрабатывает персональные данные в следующих целях:</p>
          <ul className="list-disc pl-5 mt-2 flex flex-col gap-1.5">
            <li>
              Исполнение договора розничной купли-продажи (оформление и
              исполнение заказа)
            </li>
            <li>Идентификация пользователя на сайте</li>
            <li>
              Предоставление доступа к программе лояльности и реферальной
              программе
            </li>
            <li>Направление уведомлений о статусе заказа</li>
            <li>Обработка обращений через форму обратной связи</li>
            <li>Улучшение качества работы сайта (аналитика)</li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-xl font-bold mb-3">
            3. Перечень обрабатываемых данных
          </h2>
          <ul className="list-disc pl-5 flex flex-col gap-1.5">
            <li>Фамилия, имя, отчество</li>
            <li>Номер телефона, email-адрес</li>
            <li>Контактные данные (телефон, email)</li>
            <li>История заказов и бонусных операций</li>
            <li>
              Cookies и технические данные (IP-адрес, тип браузера) — в рамках
              статистики
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-xl font-bold mb-3">
            4. Хранение персональных данных
          </h2>
          <p>
            Персональные данные хранятся на серверах, расположенных на
            территории Российской Федерации, в соответствии со ст. 18.1 ФЗ-152.
            Передача данных третьим лицам осуществляется исключительно в рамках
            исполнения договора и только при необходимости; в таких случаях мы
            заключаем договоры с контрагентами, гарантирующие защиту ПД.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-bold mb-3">
            5. Права субъекта персональных данных
          </h2>
          <p>Вы вправе:</p>
          <ul className="list-disc pl-5 mt-2 flex flex-col gap-1.5">
            <li>Получить информацию об обрабатываемых данных</li>
            <li>Потребовать уточнения, блокирования или уничтожения данных</li>
            <li>Отозвать согласие на обработку данных</li>
            <li>Обратиться в Роскомнадзор с жалобой</li>
          </ul>
          <p className="mt-3">
            Запросы направляйте по адресу:{" "}
            <a
              href="mailto:privacy@kraskaprof.ru"
              className="text-primary hover:underline"
            >
              privacy@kraskaprof.ru
            </a>
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-bold mb-3">6. Cookies</h2>
          <p>
            Сайт использует файлы cookie для обеспечения работы корзины,
            хранения предпочтений и сбора аналитики (Яндекс Метрика). При первом
            посещении пользователь уведомляется о применении cookie и может
            отказаться от них через настройки браузера.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-bold mb-3">
            7. Контакты Оператора
          </h2>
          <p>
            ООО «КраскаПроф», 123056, г. Москва, ул. Красочная, д. 15, стр. 2
            <br />
            Email:{" "}
            <a
              href="mailto:privacy@kraskaprof.ru"
              className="text-primary hover:underline"
            >
              privacy@kraskaprof.ru
            </a>
            <br />
            Телефон:{" "}
            <a href="tel:88001234567" className="text-primary hover:underline">
              8 800 123-45-67
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
