from django.shortcuts import render

from django.shortcuts import (
    render,
    get_object_or_404,
)

from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

from .models import User, Strategy, Log, Lap

from rest_framework import viewsets, permissions
from backend.serializers import RegisterSerializer, StrategySerializer, LogSerializer, LapSerializer

class RegisterView(viewsets.ModelViewSet):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer
    http_method_names = ['get', 'post', 'head']

    def get_queryset(self):
        """
        This view should return a list of all the user
        details if authenticated.
        """
        queryset = User.objects.filter(pk=self.request.user.id)
        return queryset

class StrategyViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows strategies to be viewed or edited.
    """
    queryset = Strategy.objects.all()
    serializer_class = StrategySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        This view should return a list of all the Strategies
        for the currently authenticated user.
        """
        user = self.request.user
        if user.is_authenticated:
            return Strategy.objects.filter(user=user)
        return None
        
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class LogViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows strategies to be viewed or edited.
    """
    queryset = Log.objects.all()
    serializer_class = LogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        This view should return a list of all the Logs
        for the currently authenticated user.
        """
        user = self.request.user
        if user.is_authenticated:
            queryset = Log.objects.filter(user=user)
            # get strategy as query parameter
            strategy_id = self.request.query_params.get('strategy')
            if strategy_id is not None:
                queryset = queryset.filter(strategy__pk=strategy_id)
            return queryset
        return None

    def perform_create(self, serializer):
        strategy = self.request.data.get('strategy').split('/')[-2]
        date = self.request.data.get('date').split('T')[0]
        queryset = Log.objects.filter(user=self.request.user, strategy=get_object_or_404(Strategy, pk=strategy))

        if serializer.is_valid():
            for query in queryset:
                if query.date.strftime("%Y-%m-%d") == date:
                    raise ValidationError('Repeated date')
            serializer.save(user=self.request.user)
        
class LapViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows strategies to be viewed or edited.
    """
    queryset = Lap.objects.all()
    serializer_class = LapSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        This view should return a list of all the Laps
        for the currently authenticated user.
        """
        user = self.request.user
        if user.is_authenticated:
            queryset = Lap.objects.filter(user=user)
            # get strategy as query parameter
            strategy_id = self.request.query_params.get('strategy')
            # get log as query parameter
            log_id = self.request.query_params.get('log')
            if strategy_id is not None:
                queryset = queryset.filter(log__strategy__id=strategy_id)
            if log_id is not None:
                queryset = queryset.filter(log__id=log_id)
            return queryset
        return None

    def perform_create(self, serializer):
        log = Log.objects.get(pk=self.request.data.get('log'))
        laps = Lap.objects.filter(log=log)
        for lap in laps:
            if lap.order == self.request.data.get('order'):
                raise ValidationError('Lap already exists')
        serializer.save(user=self.request.user, log=log)

def index(request):
    return render(request, "backend/index.html")
