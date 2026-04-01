from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status


from pipelines.query.query_animes import query_animes


class AnimeDashboardAPIView(APIView):

    def get(self, request):
        try:
            page = int(request.GET.get("page", 1))

            def flat_list(key):
                """Aceita ?genres=A&genres=B  e também  ?genres=A,B"""
                raw = request.GET.getlist(key)
                result = []
                for item in raw:
                    result.extend([v.strip() for v in item.split(",") if v.strip()])
                return result or None

            genres = flat_list("genres")
            themes = flat_list("themes")
            types  = flat_list("types")
            season = flat_list("season")

            year_min = request.GET.get("year_min")
            year_max = request.GET.get("year_max")
            score_min = request.GET.get("score_min")
            score_max = request.GET.get("score_max")

            order_by = request.GET.get("order_by", "rank")
            order_dir = request.GET.get("order_dir", "asc")

            result = query_animes(
                page=page,
                genres=genres,
                themes=themes,
                types=types,
                season=season,
                year_min=int(year_min) if year_min else None,
                year_max=int(year_max) if year_max else None,
                score_min=float(score_min) if score_min else None,
                score_max=float(score_max) if score_max else None,
                order_by=order_by,
                order_dir=order_dir,
            )

            return Response(result, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )