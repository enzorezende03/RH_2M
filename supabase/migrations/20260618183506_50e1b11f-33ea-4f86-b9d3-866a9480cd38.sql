
-- Ana Braga é a raiz
UPDATE public.colaboradores SET lider = NULL
 WHERE id = '5c300a93-d77a-42b0-bfd7-7ff6988cbc39';

-- Reportes diretos à Ana Braga
UPDATE public.colaboradores SET lider = '5c300a93-d77a-42b0-bfd7-7ff6988cbc39'
 WHERE id IN (
   '6393951e-6d8f-48ca-8cf6-db2849e7f184', -- Daniela Bicalho
   'b4052b1d-deb7-4436-ae7a-21d535011d1b', -- Livia Xavier
   '30b4319e-d543-4bc2-9feb-6bf3681e45c4', -- Marta Cardoso
   'a170fcb4-1e8f-4778-957d-724914824e2f', -- Luciana Souza
   '5c7472f6-c474-49b4-972b-68d90d964aa7', -- Sulamita Machado
   '6e90be54-4193-434d-873e-78b6397c8170', -- Matheus Gabrich
   'da44078b-2ffb-4520-ba39-513c9d6b9325', -- Laura Roberto
   '80d617f2-25cc-4b5e-bfc9-3ddf8fced1de', -- Stephany Oliveira
   '3b90f204-d3c2-4719-acf4-6f5b39f58b8f', -- Esther Silva
   'b84df07a-e7e9-4892-a290-be32140bc043'  -- Enzo Paolucci
 );

-- Todos os demais reportam à Daniela Nascimento
UPDATE public.colaboradores SET lider = '6393951e-6d8f-48ca-8cf6-db2849e7f184'
 WHERE id NOT IN (
   '5c300a93-d77a-42b0-bfd7-7ff6988cbc39',
   '6393951e-6d8f-48ca-8cf6-db2849e7f184',
   'b4052b1d-deb7-4436-ae7a-21d535011d1b',
   '30b4319e-d543-4bc2-9feb-6bf3681e45c4',
   'a170fcb4-1e8f-4778-957d-724914824e2f',
   '5c7472f6-c474-49b4-972b-68d90d964aa7',
   '6e90be54-4193-434d-873e-78b6397c8170',
   'da44078b-2ffb-4520-ba39-513c9d6b9325',
   '80d617f2-25cc-4b5e-bfc9-3ddf8fced1de',
   '3b90f204-d3c2-4719-acf4-6f5b39f58b8f',
   'b84df07a-e7e9-4892-a290-be32140bc043'
 );
