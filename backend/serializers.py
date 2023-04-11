from django.core import exceptions
from django.contrib.auth.password_validation import validate_password
from .models import User, Strategy, Log, Lap
from rest_framework import serializers

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    confirmPassword = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'confirmPassword', 'email', 'first_name', 'last_name')

    def validate(self, data):
         user = User(username = data.get('username'))
         
         # get the password from the data
         password = data.get('password')
         
         errors = dict() 
         try:
             # validate the password and catch the exception
             validate_password(password=password, user=user)
         
         # the exception raised here is different than serializers.ValidationError
         except exceptions.ValidationError as e:
             errors['password'] = list(e.messages)
         
         if errors:
             raise serializers.ValidationError(errors)
          
         return super(RegisterSerializer, self).validate(data)

    def create(self, validated_data):
        user = User.objects.create(username=validated_data['username'])
        if "email" in validated_data:
            user.email = validated_data['email']
        elif "first_name" in validated_data:
            user.first_name = validated_data['first_name']
        elif "last_name" in validated_data:
            user.last_name = validated_data['last_name']
        user.set_password(validated_data['password'])
        user.save()
        return user

class StrategySerializer(serializers.HyperlinkedModelSerializer):
    owner = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Strategy
        fields = ['url', 'id', 'owner', 'name', 'description', 'date']

class LogSerializer(serializers.HyperlinkedModelSerializer):
    owner = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Log
        fields = ['url', 'id', 'owner', 'strategy', 'duration', 'distance', 'note', 'date']

    # Filter Renderer HTML FORM fields at default APIBROWSER
    def get_fields(self):
        fields = super().get_fields()
        request = self.context['request']
        if request.user.is_authenticated:
            fields['strategy'].queryset = Strategy.objects.filter(user=request.user)
        else:
            fields['strategy'].queryset = None
        return fields

class LapSerializer(serializers.HyperlinkedModelSerializer):
    owner = serializers.ReadOnlyField(source='user.username')
    log = serializers.ReadOnlyField(source='log.id')

    class Meta:
        model = Lap
        fields = ['url', 'id', 'owner', 'order', 'log', 'duration']

    # Filter Renderer HTML FORM fields at default APIBROWSER
    def get_fields(self):
        fields = super().get_fields()
        request = self.context['request']
        if request.user.is_authenticated:
            fields['log'].queryset = Log.objects.filter(user=request.user)
        else:
            fields['log'].queryset = None
        return fields