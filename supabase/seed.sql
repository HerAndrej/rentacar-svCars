-- Seed SV Cars vehicle data (matches confirmed fleet)

INSERT INTO vehicles (slug, name, category, transmission, fuel, year, price_daily, price_weekly, sort_order, specs) VALUES
  ('porsche-macan-turbo', 'Porsche Macan Turbo', 'premium', 'automatic', 'petrol', 2020, 400, NULL, 1, '{"seats": 5, "doors": 5, "luggage": 2, "ac": true, "bluetooth": true, "gps": true, "leather": true, "panorama": true}'),
  ('peugeot-5008-1-5-hdi', 'Peugeot 5008 1.5 HDI', 'suv', 'automatic', 'diesel', 2019, 120, 100, 2, '{"seats": 7, "doors": 5, "luggage": 3, "ac": true, "bluetooth": true, "gps": true}'),
  ('golf-gtd-7-crni', 'Golf GTD 7 Panorama (Crni)', 'compact', 'automatic', 'diesel', 2017, 100, 85, 3, '{"seats": 5, "doors": 5, "luggage": 2, "ac": true, "bluetooth": true, "panorama": true}'),
  ('golf-gtd-7-sivi', 'Golf GTD 7 (Sivi)', 'compact', 'automatic', 'diesel', 2017, 100, 85, 4, '{"seats": 5, "doors": 5, "luggage": 2, "ac": true, "bluetooth": true}'),
  ('peugeot-3008-1-5-hdi', 'Peugeot 3008 1.5 HDI', 'suv', 'automatic', 'diesel', 2019, 90, 75, 5, '{"seats": 5, "doors": 5, "luggage": 2, "ac": true, "bluetooth": true, "gps": true}'),
  ('peugeot-2008-1-2', 'Peugeot 2008 1.2', 'compact', 'automatic', 'petrol', 2021, 90, 75, 6, '{"seats": 5, "doors": 5, "luggage": 2, "ac": true, "bluetooth": true}'),
  ('citroen-c3', 'Citroen C3', 'economy', 'manual', 'petrol', 2018, 70, 55, 7, '{"seats": 5, "doors": 5, "luggage": 1, "ac": true, "bluetooth": true}'),
  ('citroen-c4-cactus', 'Citroen C4 Cactus', 'compact', 'automatic', 'diesel', 2020, 70, 55, 8, '{"seats": 5, "doors": 5, "luggage": 2, "ac": true, "bluetooth": true}'),
  ('renault-trafic-2-0-dci', 'Renault Trafic 2.0 DCI', 'van', 'manual', 'diesel', 2018, 200, NULL, 9, '{"seats": 9, "doors": 5, "luggage": 4, "ac": true, "bluetooth": true}'),
  ('can-am-outlander-1000-xmr', 'Can-Am Outlander 1000 XMR', 'quad', 'automatic', 'petrol', 2023, 150, NULL, 10, '{"seats": 2, "type": "quad", "helmet_included": true}'),
  ('loncin-quad', 'Loncin Quad', 'quad', 'automatic', 'petrol', 2022, 150, NULL, 11, '{"seats": 2, "type": "quad", "helmet_included": true}');
