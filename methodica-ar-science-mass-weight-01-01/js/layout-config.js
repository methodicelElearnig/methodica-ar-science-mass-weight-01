/*
 * layout-config.js — מיקומים ידניים לאלמנטים של כל שקף
 *
 * ארכיטקטורה:
 *   - כל מפתח הוא שם סמנטי (hotspotBall, bubbleFish וכו')
 *   - הערכים הם CSS strings בלבד (left, top, right, bottom, width, height)
 *   - אין חישובים בזמן ריצה — הערכים ישירים ל-style
 *   - המיפוי בין מפתח לאלמנט ID מוגדר ב-LAYOUT_MAP ב-main.js
 *
 * לעדכון מיקום: שנו רק קובץ זה. אין צורך לגעת ב-CSS, JS, או HTML.
 */

window.LAYOUT_CONFIG = {

  /* ── שקף 7: חוף הים ─────────────────────────────────────────── */
  "7": {
    hotspotBall:    { left: "64.6%", top: "39.2%" },  /* כדור */
    hotspotGrandpa: { left: "16.5%", top: "39.2%" },  /* כובע קש / סבא */
    hotspotCup:     { left: "37.8%", top: "62.8%" },  /* כוס / אישה */
    hotspotBaby:    { left: "48.6%", top: "69.7%" },  /* יהב / תינוק */
    hotspotFish:    { left: "88.5%", top: "56%"   },  /* דג זהב */
    bubbleFish:     { left: "70.9%", top: "77.9%" }   /* בועת דיבור דג */
  },

  /* ── שקף 8: הירח ─────────────────────────────────────────────── */
  "8": {
    hotspotBall:    { left: "57%",  top: "33%"   },   /* כדור */
    hotspotGrandpa: { left: "18%",  top: "42%"   },   /* כובע קש / סבא */
    hotspotCup:     { left: "35%",  top: "52%"   },   /* כוס / אישה */
    hotspotBaby:    { left: "50%",  top: "68%"   },   /* יהב / תינוק */
    hotspotFish:    { left: "81%",  top: "57%"   },   /* דג זהב */
    bubbleFish:     { right: "6%",  bottom: "8%" }    /* בועת דיבור דג */
  }

};
