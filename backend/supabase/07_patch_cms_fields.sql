update site_content
set data = data || '{"featuredWork":{"homeLimit":6,"moreWorkLabel":"More work","moreWorkArrow":"→","moreWorkPageTitle":"More work","moreWorkPageIntro":"Every project — from product design to brand craft and development."},"hero":{"navCta":"get in touch"}}'::jsonb
where id = 'main';
