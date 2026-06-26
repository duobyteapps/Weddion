import { supabase } from "@/lib/supabase";
import { getAuthenticatedUser } from "@/services/sessionService";
import type {
  DowryCategoryItem,
  DowryCategoryTableRow,
  MaterialIconName,
  UserDowryCategoryBudgetTableRow,
  UserDowryItemSummaryRow,
} from "@/types/dowry";

type DowryCategoryWithDbId = DowryCategoryItem & {
  dbId: string;
};

type DowryCategoryItemCountRow = {
  category_slug: string;
  total_count: number | string | null;
  completed_count: number | string | null;
};

function mapDowryCategory(row: DowryCategoryTableRow): DowryCategoryWithDbId {
  return {
    id: row.slug,
    dbId: row.id,
    slug: row.slug,
    title: row.title,
    icon: row.icon as MaterialIconName,
    completed: 0,
    total: 0,
    budget: 0,
    expense: 0,
    remaining: 0,
  };
}

function toSafeNumber(value: number | string | null | undefined) {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    return 0;
  }

  return parsedValue;
}

function getSafeQuantity(value: number | null | undefined) {
  if (!value || value < 1) {
    return 1;
  }

  return value;
}

export async function getDowryCategories(): Promise<DowryCategoryItem[]> {
  const { data: categoryData, error: categoryError } = await supabase
    .from("dowry_categories")
    .select("id, slug, title, icon, sort_order, is_active")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (categoryError) {
    console.log("Dowry categories supabase error:", categoryError);
    throw new Error(categoryError.message);
  }

  const categories = ((categoryData ?? []) as DowryCategoryTableRow[]).map(
    mapDowryCategory,
  );

  if (categories.length === 0) {
    return [];
  }

  const countsByCategorySlug = new Map<
    string,
    {
      total: number;
      completed: number;
    }
  >();

  const { data: countData, error: countError } = await supabase.rpc(
    "get_dowry_category_item_counts",
  );

  if (countError) {
    console.log("Dowry item counts supabase error:", countError);
  } else {
    ((countData ?? []) as DowryCategoryItemCountRow[]).forEach((item) => {
      countsByCategorySlug.set(item.category_slug, {
        total: Number(item.total_count ?? 0),
        completed: Number(item.completed_count ?? 0),
      });
    });
  }

  let userId: string | null = null;

  try {
    const user = await getAuthenticatedUser();
    userId = user.id;
  } catch (error) {
    console.log("Dowry authenticated user error:", error);
  }

  const expenseByCategoryId = new Map<string, number>();
  const budgetByCategoryId = new Map<string, number>();

  if (userId) {
    const categoryDbIds = categories.map((category) => category.dbId);

    const { data: itemSummaryData, error: itemSummaryError } = await supabase
      .from("user_dowry_items")
      .select("category_id, quantity, price")
      .eq("user_id", userId)
      .in("category_id", categoryDbIds);

    if (itemSummaryError) {
      console.log("Dowry item summary supabase error:", itemSummaryError);
    } else {
      ((itemSummaryData ?? []) as UserDowryItemSummaryRow[]).forEach((item) => {
        const currentExpense = expenseByCategoryId.get(item.category_id) ?? 0;
        const quantity = getSafeQuantity(item.quantity);
        const price = toSafeNumber(item.price);

        expenseByCategoryId.set(
          item.category_id,
          currentExpense + price * quantity,
        );
      });
    }

    const { data: budgetData, error: budgetError } = await supabase
      .from("user_dowry_category_budgets")
      .select("category_id, budget")
      .eq("user_id", userId)
      .in("category_id", categoryDbIds);

    if (budgetError) {
      console.log("Dowry budget supabase error:", budgetError);
    } else {
      ((budgetData ?? []) as UserDowryCategoryBudgetTableRow[]).forEach(
        (item) => {
          budgetByCategoryId.set(item.category_id, toSafeNumber(item.budget));
        },
      );
    }
  }

  return categories.map((category) => {
    const counts = countsByCategorySlug.get(category.slug) ?? {
      total: 0,
      completed: 0,
    };

    const budget = budgetByCategoryId.get(category.dbId) ?? 0;
    const expense = expenseByCategoryId.get(category.dbId) ?? 0;
    const remaining = budget - expense;

    return {
      id: category.id,
      slug: category.slug,
      title: category.title,
      icon: category.icon,
      completed: counts.completed,
      total: counts.total,
      budget,
      expense,
      remaining,
    };
  });
}

export async function upsertDowryCategoryBudget({
  categorySlug,
  budget,
}: {
  categorySlug: string;
  budget: number;
}) {
  const safeBudget = Number.isFinite(budget) && budget > 0 ? budget : 0;

  const { data, error } = await supabase.rpc("upsert_dowry_category_budget", {
    p_category_slug: categorySlug,
    p_budget: safeBudget,
  });

  if (error) {
    console.log("Dowry budget rpc save error:", error);
    throw new Error(error.message);
  }

  return toSafeNumber(data);
}
