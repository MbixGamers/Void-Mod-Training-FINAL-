import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useSubmissions() {
  const { toast } = useToast();
  return useQuery({
    queryKey: [api.submissions.list.path],
    queryFn: async () => {
      const res = await apiRequest("GET", api.submissions.list.path);
      const data = await res.json();
      return api.submissions.list.responses[200].parse(data);
    },
  });
}

export function useSubmission(id: string) {
  return useQuery({
    queryKey: [api.submissions.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.submissions.get.path, { id });
      const res = await apiRequest("GET", url);
      const data = await res.json();
      return api.submissions.get.responses[200].parse(data);
    },
    enabled: !!id,
  });
}

export function useCreateSubmission() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", api.submissions.create.path, data);
      const json = await res.json();
      return api.submissions.create.responses[201].parse(json);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.submissions.list.path] });
      toast({
        title: "Success",
        description: "Your submission has been received!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useAdminAction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, action, answers }: { id: string; action: "approve" | "deny"; answers?: Record<string, string> }) => {
      const url = buildUrl(api.admin.action.path, { id });
      const res = await apiRequest("POST", url, { action, answers });
      const data = await res.json();
      return api.admin.action.responses[200].parse(data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.submissions.list.path] });
      toast({
        title: variables.action === "approve" ? "Approved" : "Denied",
        description: `Submission has been ${variables.action}ed.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Action Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
