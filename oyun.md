# ☁️ SERVER ARCHITECTURE (ANTI CHEAT)
727: 
728: VERY IMPORTANT.
729: 
730: The game must be:
731: SERVER AUTHORITATIVE.
732: 
733: Client must NEVER:
734: 
735: * generate coins
736: * modify timers
737: * create items
738: * validate rewards
739: 
740: Server validates EVERYTHING.
741: 
742: ---
743: 
744: # 🔒 SUPABASE ARCHITECTURE
745: 
746: Use:
747: 
748: * Supabase Auth
749: * Supabase Database
750: * Supabase Realtime
751: * Supabase Edge Functions
752: 
753: ## Supabase Credentials
754: 
755: *   **URL**: https://olbbyqyrgkgwrodjbeka.supabase.co
756: *   **Public Key**: sb_publishable_rWY9CQZbsu15yeuuxElgAQ_tmQNNtq0
757: *   **PostgreSQL URL**: postgresql://postgres:[YOUR-POSTGRES-PASSWORD]@db.olbbyqyrgkgwrodjbeka.supabase.co:5432/postgres (Replace [YOUR-POSTGRES-PASSWORD] with your actual password)
758: *   **Access Token**: [YOUR-ACCESS-TOKEN] (Keep this secure and do not commit)
759: *   **Service Role Key**: [YOUR-SERVICE-ROLE-KEY] (Keep this secure and do not commit)
760: 
761: ---
762: 
763: # 🔒 ANTI CHEAT DESIGN
764: 
765: Client:
766: 
767: * sends action request
768: 
769: Server:
770: 
771: * validates time
772: * validates inventory
773: * calculates rewards
774: * updates resources
775: 
776: Use Edge Functions for:
777: 
778: * harvesting
779: * factory processing
780: * contract completion
781: * market transactions
782: 
783: ---
784: 
785: # 📊 CORE MATHEMATICAL SYSTEMS
786: 
787: ## Crop Yield Formula
788: 
789: Yield=BaseYield\times WaterModifier\times FertilizerModifier\times ResearchBonus\times RadiationBonus
790: 
791: ---
792: 
793: ## Market Price Formula
794: 
795: MarketPrice=BasePrice\times DemandMultiplier\times EventMultiplier
796: 
797: ---
798: 
799: ## EXP Formula
800: 
801: EXP=(SellValue\times 0.1)+(ResearchLevel\times 25)
802: 
803: ---
804: 
805: ## Level Formula
806: 
807: RequiredEXP=100\times(Level^{1.5})
808: 
809: ---
810: 
811: # 📱 MOBILE UX RULES
812: 
813: The game must:
814: 
815: * support one-hand gameplay
816: * have large touch targets
817: * use responsive scaling
818: * minimize text clutter
819: * prioritize smooth animations
820: 
821: All UI should feel:
822: 
823: * futuristic
824: * holographic
825: * responsive
826: * alive
827: 
828: ---
829: 
830: # 🎯 FINAL GOAL
831: 
832: The player should eventually build:
833: 
834: * a gigantic underground civilization
835: * fully automated production chains
836: * AI-controlled agriculture
837: * massive reactor-powered districts
838: * genetically engineered food systems
839: * MegaCorp-scale industrial networks
840: 
841: The game fantasy is:
842: 
843: "I built humanity's last food empire underground."
844: 
845: ---
