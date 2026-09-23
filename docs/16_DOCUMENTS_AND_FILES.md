# 16 — DOCUMENTS AND FILES

## 1. Цель

Документы и фото — часть бизнес-процесса, а не декоративные attachments.

Система должна хранить:
- кто загрузил;
- когда;
- к какой заявке;
- тип;
- где используется.

---

## 2. Attachment vs Document

### Attachment
Физический файл / объект storage.

### Document
Бизнес-сущность, которая может ссылаться на Attachment.

Пример:
`Акт оказанных услуг №124`
→ Document
→ PDF Attachment.

Фото груза может быть только Attachment без Document.

---

## 3. Attachment categories

```text
CARGO_PHOTO
WAREHOUSE_PHOTO
DOCUMENT
INVOICE
PROOF_OF_DELIVERY
OTHER
```

При необходимости UI может иметь более понятные русские labels.

---

## 4. Document types

Demo minimum:
- supplier_document;
- waybill;
- invoice;
- act;
- transport_document;
- proof_of_delivery;
- other.

Не создавать юридически значимую классификацию без требований клиента.

---

## 5. Upload flow

1. User selects file / camera.
2. Client validates basic size/type.
3. Server validates again.
4. File uploads to storage.
5. Attachment record created.
6. Audit event created if significant.
7. UI refreshes.

---

## 6. File restrictions

Для Demo:
- images: jpg, jpeg, png, webp;
- documents: pdf;
- optionally doc/docx/xls/xlsx if needed.

Recommended max:
- images 10 MB;
- documents 20 MB.

Конкретные лимиты можно вынести в config.

---

## 7. Storage path

Рекомендуемый формат:

```text
orders/{orderId}/{category}/{uuid}-{safeFilename}
```

Не использовать raw user filename как единственный path.

---

## 8. Visibility

Attachment должен иметь business visibility.

Минимально:
- client-visible;
- internal.

Если не хочется отдельного enum на первом этапе:
visibility можно вывести из category / linked document only при чётком правиле.

Предпочтительно всё же explicit visibility.

---

## 9. Client files

Client может:
- загрузить документ в draft;
- загрузить дополнительные документы после submit;
- видеть свои файлы;
- видеть файлы, предоставленные компанией и помеченные client-visible.

---

## 10. Driver files

Driver:
- cargo photos;
- proof of pickup;
- proof of delivery;
- relevant document photo.

Не показывать driver весь document archive.

---

## 11. Warehouse files

Warehouse:
- intake photos;
- discrepancy photos;
- processing result;
- release photo.

---

## 12. Preview

UI:
- image thumbnail;
- PDF icon / preview link;
- filename;
- size;
- uploader;
- date.

Actions по permission:
- preview;
- download;
- delete only before immutable stage / if allowed.

---

## 13. Deletion

Business files после использования не удалять бесследно.

Для Demo:
- draft attachment можно удалить;
- operational attachment лучше mark/delete only with audit;
- completed order files — read-only.

---

## 14. Versioning

Полноценное versioning документов не обязательно.

Но архитектура не должна предполагать «у заявки может быть только один файл».

Если пользователь загружает новый документ:
- можно создать новый Document / Attachment;
- старый не перезаписывать молча.

---

## 15. Broken file prevention

Seed:
- использовать локальные реальные placeholder assets;
- либо валидные storage objects.

Не оставлять `href="#"` и broken URLs в demo.

Локальное демо может хранить приватные объекты в игнорируемой Git папке `.appdata/uploads`. Файлы не размещаются в публичном каталоге сайта и отдаются только через серверный маршрут после проверки пользователя, заявки и видимости вложения. В production требуется внешний приватный Storage; локальный fallback там отключён.

---

## 16. Security

- validate mime;
- validate size;
- randomize storage path;
- server permission before signed URL;
- не делать все файлы public bucket по умолчанию.

Для demo допускается упрощение, но структура должна быть безопасно расширяемой.
