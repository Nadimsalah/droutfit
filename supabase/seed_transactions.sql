-- Seed Data for Transactions
-- Generates ~50 transactions over the last 90 days

DO $$
DECLARE
    user_record RECORD;
    i INT;
    random_days INT;
    random_amount DECIMAL;
    random_type TEXT;
BEGIN
    -- Loop through existing users to assign transactions
    FOR user_record IN SELECT id FROM auth.users LIMIT 10 LOOP
        
        -- Creating Subscription Payments (Monthly)
        FOR i IN 1..3 LOOP
            INSERT INTO public.transactions (user_id, amount, type, description, created_at)
            VALUES (
                user_record.id, 
                5.00, 
                'SUBSCRIPTION', 
                'Merchant Access Plan - Monthly',
                NOW() - (i * INTERVAL '30 days')
            );
        END LOOP;

        -- Creating Credit Top-ups (Random)
        FOR i IN 1..5 LOOP
            random_days := floor(random() * 90 + 1);
            
            -- Randomize amount based on credit tiers (roughly)
            IF random() > 0.7 THEN
                random_amount := 20.00; -- ~500 credits
            ELSE
                random_amount := 4.00; -- ~100 credits
            END IF;

            INSERT INTO public.transactions (user_id, amount, type, description, created_at)
            VALUES (
                user_record.id, 
                random_amount, 
                'CREDITS', 
                'AI Credit Top-up',
                NOW() - (random_days * INTERVAL '1 day')
            );
        END LOOP;
        
    END LOOP;
END $$;
