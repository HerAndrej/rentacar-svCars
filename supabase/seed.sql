-- Seed SV Cars vehicle data (from confirmed price list)

INSERT INTO vehicles (slug, name, category, transmission, fuel, year, price_daily, price_weekly, sort_order, specs) VALUES
  ('lincoln-quad-lx700au-5', 'Lincoln Quad LX700AU-5', 'quad', 'automatic', 'petrol', 2023, 150, NULL, 1, '{"seats": 1, "type": "quad", "helmet_included": true}'),
  ('peugeot-5008-1-5-hdi', 'Peugeot 5008 1.5 HDI', 'suv', 'automatic', 'diesel', 2020, 120, 100, 2, '{"seats": 7, "doors": 5, "luggage": 3, "ac": true, "bluetooth": true, "gps": true}'),
  ('peugeot-3008-1-5-hdi', 'Peugeot 3008 1.5 HDI', 'suv', 'automatic', 'diesel', 2019, 90, 75, 3, '{"seats": 5, "doors": 5, "luggage": 2, "ac": true, "bluetooth": true, "gps": true}'),
  ('citroen-c3', 'Citroen C3', 'economy', 'manual', 'petrol', 2018, 70, 55, 4, '{"seats": 5, "doors": 5, "luggage": 1, "ac": true, "bluetooth": true}'),
  ('peugeot-2008-1-2', 'Peugeot 2008 1.2', 'compact', 'automatic', 'petrol', 2020, 90, 75, 5, '{"seats": 5, "doors": 5, "luggage": 2, "ac": true, "bluetooth": true}'),
  ('citroen-c4-cactus', 'Citroen C4 Cactus', 'compact', 'automatic', 'diesel', 2018, 70, 55, 6, '{"seats": 5, "doors": 5, "luggage": 2, "ac": true, "bluetooth": true}'),
  ('renault-trafic-2-0-dci', 'Renault Trafic 2.0 DCI', 'van', 'manual', 'diesel', 2019, 200, NULL, 7, '{"seats": 9, "doors": 5, "luggage": 4, "ac": true, "bluetooth": true}'),
  ('volkswagen-golf', 'Volkswagen Golf', 'compact', 'manual', 'diesel', 2016, 90, 75, 8, '{"seats": 5, "doors": 5, "luggage": 2, "ac": true, "bluetooth": true}'),
  ('porsche-macan-turbo', 'Porsche Macan Turbo', 'premium', 'automatic', 'petrol', 2018, 400, NULL, 9, '{"seats": 5, "doors": 5, "luggage": 2, "ac": true, "bluetooth": true, "gps": true, "leather": true, "panorama": true}'),
  ('golf-gtd-2017-automatik-panorama', 'Golf GTD 2017 Automatik Panorama', 'compact', 'automatic', 'diesel', 2017, 100, 85, 10, '{"seats": 5, "doors": 5, "luggage": 2, "ac": true, "bluetooth": true, "panorama": true}');
